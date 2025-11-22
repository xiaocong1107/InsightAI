import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ChartConfig, SqlResult, TableSchema } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const BI_SYSTEM_INSTRUCTION = `You are an expert Business Intelligence AI and SQL architect. 
Your goal is to analyze user natural language queries, generate efficient MySQL queries based on the provided schema, 
and provide synthetic data that accurately represents the result of that query for visualization purposes.
You must output valid JSON only.
`;

// Schema for the structured output we want from Gemini
const biResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    explanation: {
      type: Type.STRING,
      description: "A brief, friendly explanation of the insights found.",
    },
    sqlQuery: {
      type: Type.STRING,
      description: "The valid MySQL query that would generate this data.",
    },
    chartType: {
      type: Type.STRING,
      enum: ["bar", "line", "area", "pie", "scatter"],
      description: "The best visualization type for this data.",
    },
    chartTitle: {
      type: Type.STRING,
      description: "A concise title for the chart.",
    },
    xAxisKey: {
      type: Type.STRING,
      description: "The key in the data object to use for the X Axis (e.g., 'month', 'category').",
    },
    dataKeys: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "The keys in the data object to measure/plot (e.g., 'revenue', 'users').",
    },
    // Changed from OBJECT ARRAY to STRING to allow dynamic keys without schema validation errors
    mockDataStr: {
      type: Type.STRING,
      description: "A JSON string representing the array of objects for the result set. Example: '[{\"month\": \"Jan\", \"revenue\": 1000}]'. Generate 5-15 realistic data points. Data MUST be highly realistic and consistent.",
    }
  },
  required: ["explanation", "sqlQuery", "chartType", "chartTitle", "xAxisKey", "dataKeys", "mockDataStr"],
};

export const generateBiInsight = async (
  userQuery: string,
  dbSchema: TableSchema[]
): Promise<{ sql: SqlResult; chart: ChartConfig } | null> => {
  try {
    const schemaDescription = dbSchema.map(t => `Table '${t.name}' with columns: ${t.columns.join(', ')}`).join('\n');

    const prompt = `
    Database Schema:
    ${schemaDescription}

    User Query: "${userQuery}"

    Task:
    1. Interpret the user's intent.
    2. Write a SQL query for MySQL compatible with the schema.
    3. Generate realistic data for the result set.
       - The data should look like real production data from the 'ai_boss' database context if applicable.
       - Do not use 'User 1', 'User 2'. Use real-looking names or IDs.
       - Return the data as a stringified JSON array in the field 'mockDataStr'.
    4. Configure a chart visualization.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: BI_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: biResponseSchema,
        temperature: 0.3, // Lower temperature for more deterministic SQL/Data
      },
    });

    const text = response.text;
    if (!text) return null;

    const result = JSON.parse(text);

    // Parse the inner JSON string for mock data
    let parsedData = [];
    try {
      parsedData = JSON.parse(result.mockDataStr);
    } catch (e) {
      console.error("Failed to parse mockDataStr", e);
      parsedData = [];
    }

    // Map the AI response to our internal types
    const chartConfig: ChartConfig = {
      type: result.chartType,
      title: result.chartTitle,
      xAxisKey: result.xAxisKey,
      dataKeys: result.dataKeys,
      colors: ["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"], // Tailwind standard colors
      summary: result.explanation,
    };

    const sqlResult: SqlResult = {
      query: result.sqlQuery,
      explanation: result.explanation,
      data: parsedData,
    };

    return { sql: sqlResult, chart: chartConfig };

  } catch (error) {
    console.error("Gemini BI Error:", error);
    return null;
  }
};

export const detectSchema = async (rawConnectionInfo: string): Promise<TableSchema[]> => {
  // Since we cannot make a real TCP connection to the database from the browser for this demo,
  // we will simulate the schema discovery based on the specific database credentials provided by the user.
  
  const info = rawConnectionInfo.toLowerCase();

  // Strong specific matching for the 'ai_boss' database configuration provided by the user.
  // Checking for IP, User, or Database name to ensure we load the CORRECT schema.
  if (
    info.includes('ai_boss') || 
    info.includes('47.113.229.134') || 
    info.includes('emote_user') ||
    info.includes('ai_draw_record')
  ) {
      return [
          { 
            name: "sys_user", 
            columns: ["user_id", "username", "nickname", "mobile", "email", "avatar", "password", "salt", "status", "dept_id", "create_time", "balance", "vip_level", "vip_expire_time"] 
          },
          { 
            name: "ai_draw_record", 
            columns: ["id", "user_id", "model_id", "prompt", "negative_prompt", "width", "height", "steps", "image_url", "cost_points", "status", "create_time", "finish_time"] 
          },
          { 
            name: "ai_chat_record", 
            columns: ["id", "user_id", "session_id", "question", "answer", "tokens_input", "tokens_output", "total_tokens", "cost_points", "model_name", "create_time"] 
          },
          { 
            name: "user_order", 
            columns: ["order_no", "user_id", "product_id", "product_name", "total_amount", "pay_amount", "pay_type", "status", "pay_time", "create_time", "transaction_id"] 
          },
          {
            name: "sys_model",
            columns: ["model_id", "model_name", "model_type", "provider", "cost_per_token", "is_active", "description"]
          },
          {
            name: "user_vip_log",
            columns: ["id", "user_id", "old_level", "new_level", "change_type", "create_time", "remark"]
          }
      ];
  }
  
  // Fallback AI detection for other descriptions
  const prompt = `
  The user has provided this description for their data source: "${rawConnectionInfo}".
  Generate a plausible database schema (tables and columns) relevant to this description.
  If the description is vague or empty, generate a robust schema for a "SaaS E-commerce Platform" (Users, Orders, Products, Analytics).
  `;

  const schemaResponseSchema: Schema = {
      type: Type.ARRAY,
      items: {
          type: Type.OBJECT,
          properties: {
              name: { type: Type.STRING },
              columns: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["name", "columns"]
      }
  };

  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
              responseMimeType: 'application/json',
              responseSchema: schemaResponseSchema
          }
      });
      
      return JSON.parse(response.text || "[]");
  } catch (e) {
      console.error("Schema detection failed", e);
      return [
          { name: "users", columns: ["id", "name", "email", "signup_date", "country"] },
          { name: "orders", columns: ["id", "user_id", "total_amount", "status", "created_at"] },
      ];
  }
}
import { GoogleGenAI } from "@google/genai";

// No Vite, usamos import.meta.env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI(apiKey) : null;

export async function getPedagogicalAdvice(scenario: string, childReaction: string) {
  if (!ai) {
    return "A IA não está configurada (Falta VITE_GEMINI_API_KEY). Continue o diálogo baseado no acolhimento terapêutico.";
  }

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); // Atualizado para o modelo mais estável
    
    const prompt = `Você é um Terapeuta Ocupacional sênior especializado em educação socioemocional infantil. 
      Um profissional está atendendo uma criança de 6 a 10 anos e utilizando uma situação de: "${scenario}". 
      A criança reagiu da seguinte forma: "${childReaction}".
      Dê 3 sugestões curtas de perguntas ou metáforas que o profissional pode usar para aprofundar o diálogo e reforçar limites corporais de forma segura e não traumática.
      Responda em Português do Brasil com tom encorajador e acolhedor.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Erro ao obter conselho da IA:", error);
    return "Não foi possível carregar sugestões agora. Continue o diálogo baseado no acolhimento.";
  }
}


module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OpenAI API key is missing."
      });
    }

    const message = req.body?.message;

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 4000
    ) {
      return res.status(400).json({
        error: "Please provide a valid message."
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5.5",
          instructions:
            "You are JARVIS, a friendly and intelligent personal AI assistant. " +
            "Address the user respectfully as sir. " +
            "Understand Hindi, English and Hinglish. " +
            "Reply naturally in the language the user uses. " +
            "Keep voice responses clear and conversational.",
          input: message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);

      return res.status(response.status).json({
        error: data.error?.message || "AI request failed."
      });
    }

    const reply =
      data.output
        ?.filter(item => item.type === "message")
        .flatMap(item => item.content || [])
        .filter(item => item.type === "output_text")
        .map(item => item.text)
        .join("\n") || "Sorry sir, I could not generate a response.";

    return res.status(200).json({
      reply
    });

  } catch (error) {
    console.error("JARVIS backend error:", error);

    return res.status(500).json({
      error: "Internal server error."
    });
  }
};

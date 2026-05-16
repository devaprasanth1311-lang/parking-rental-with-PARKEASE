const { OpenAI } = require('openai');

exports.handleChat = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY') {
    console.warn('OpenAI API Key is missing. Falling back to local logic.');
    return fallbackChatLogic(message, res);
  }

  try {
    const openai = new OpenAI({ apiKey });
    
    const systemPrompt = `You are the ParkEase AI Assistant, a premium help agent for the ParkEase parking marketplace. 
    You help users with questions about:
    - Finding and booking domestic house parking (driveways).
    - Listing their own driveway to earn money.
    - Safety features like CCTV integration for active bookings.
    - Location accuracy: We use exact pinpointing on maps for driveway locations.
    - Identity verification: All homeowners undergo mandatory ID verification.
    
    Specific Details:
    - Admin email: gamingraistar560@gmail.com
    - Admin phone/WhatsApp: 6369955445
    - How it works: Owners list driveways -> Admin approves -> Renters find & book -> Payment handled securely.
    - Premium features: High-resolution images, real-time CCTV monitoring (if available), and verified reviews.
    
    Tone: Professional, helpful, and concise.
    Constraint: If a question is NOT related to ParkEase or parking, politely redirect them back to ParkEase topics.
    Crucial: If you cannot answer a specific technical issue, always provide the admin contact number: 6369955445.`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: 'gpt-3.5-turbo',
      max_tokens: 200,
    });

    const botResponse = completion.choices[0].message.content;
    res.json({ reply: botResponse });
  } catch (error) {
    console.error('OpenAI Error:', error);
    fallbackChatLogic(message, res);
  }
};

function fallbackChatLogic(message, res) {
  const lowerQ = message.toLowerCase();
  let botResponse = "";

  if (lowerQ.includes("list") && (lowerQ.includes("driveway") || lowerQ.includes("space"))) {
    botResponse = "To list your driveway, click on 'List your driveway' in the navigation menu, fill in the details about your space, upload photos, and submit for approval.";
  } else if (lowerQ.includes("book") && (lowerQ.includes("parking") || lowerQ.includes("space") || lowerQ.includes("driveway"))) {
    botResponse = "You can browse available driveways on the 'Find parking' page, select a driveway, choose your dates, and click 'Book Now'.";
  } else if (lowerQ.includes("price") || lowerQ.includes("pricing") || lowerQ.includes("cost") || lowerQ.includes("fee")) {
    botResponse = "Pricing is set by the driveway owners. You can see the hourly or daily rates on each parking listing.";
  } else if (lowerQ.includes("cctv") || lowerQ.includes("security") || lowerQ.includes("safe")) {
    botResponse = "Many of our parking spaces come with CCTV. You can check the amenities on the listing page.";
  } else if (lowerQ.includes("admin") || lowerQ.includes("contact") || lowerQ.includes("support")) {
    botResponse = "You can reach out to our admin at gamingraistar560@gmail.com or call 6369955445.";
  } else {
    botResponse = "I'm sorry, I don't have information on that. Please contact our admin at 6369955445 for further queries.";
  }

  res.json({ reply: botResponse, isFallback: true });
}

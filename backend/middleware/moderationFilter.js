const moderateContent = async (req, res, next) => {
    const { content, title } = req.body;
    const fullText = `${title} ${content}`.toLowerCase();
    
    if (!fullText) return next();

    // Placeholder: In the future, send fullText to a local Python/Flask API running your BERT model
    const toxicKeywords = ['bannedword1', 'bannedword2']; // Temporary static fallback
    const isToxic = toxicKeywords.some(word => fullText.includes(word));

    if (isToxic) {
        return res.status(403).json({ message: 'Post rejected: Abusive content detected by moderation filter.' });
    }

    next();
};

module.exports = moderateContent;
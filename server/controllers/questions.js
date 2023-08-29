import Question from '../models/questions.js';
import asyncHandler from "express-async-handler";

export const newQuestion = asyncHandler(async (req, res) => {
    try {
        // Get the user ID from the authenticated user (you'll need to implement this part)
        const userId = req.userAuthId; // Replace with how you get the user ID from authentication
        // Create a new question instance
        const newQuestion = new Question({
            question: req.body.question,
            userId, // Assign the user ID to the question
        });
        // Save the new question to the database
        await newQuestion.save();
        // Respond with a success message
        res.status(201).json({
            message: "New question created successfully",
            newQuestion
        });
    } catch (error) {
        console.error("Error creating a new question:", error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});
export const searchQuestion = asyncHandler(async (req, res) => {
    const searchQuery = req.body.searchQuery;

    try {
        // Use a regular expression to perform a partial text match on the 'question' field
        const results = await Question.find({
                question: {
                    $regex: searchQuery,
                    $options: 'i'
                }
            })
            .limit(5);

        res.status(200).json(results);
    } catch (error) {
        console.error("Error searching questions:", error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
})
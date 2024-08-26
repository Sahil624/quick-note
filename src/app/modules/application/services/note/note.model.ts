export interface Note {
    id?: string;              // Unique identifier for the note
    title: string;            // Title of the note
    content: string;          // Content of the note in markdown or plain text
    createdAt: Date;          // Timestamp when the note was created
    updatedAt?: Date;         // Timestamp when the note was last updated
    tags?: string[];          // List of tags for categorizing the note
    isFavorite?: boolean;     // Flag to mark the note as a favorite
    color?: string;           // Custom color or label for organizing notes visually
    version?: number;         // Version number for tracking edits
    authorId?: string;        // Author or owner of the note (useful in multi-user scenarios)
    sharedWith?: string[];    // List of user IDs the note is shared with (for collaboration)
}

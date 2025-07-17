import asyncHandler from "express-async-handler";
import { getAuth } from "@clerk/express";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  console.log(`Fetching comments for postId: ${postId}`);
  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture");

  console.log(`Comments found: ${comments.length}`);
  res.status(200).json({ comments });
});

export const createComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;
  const { content } = req.body;

  console.log(`Creating comment for postId: ${postId}, userId: ${userId}`);

  if (!content || content.trim() === "") {
    console.log("Comment content is empty");
    return res.status(400).json({ error: "Comment content is required" });
  }

  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);

  console.log("User:", user);
  console.log("Post:", post);

  if (!user || !post) {
    console.log(`User or post not found - User: ${user}, Post: ${post}`);
    return res.status(404).json({ error: "User or post not found" });
  }

  const comment = await Comment.create({
    user: user._id,
    post: postId,
    content,
  });

  console.log("Comment created:", comment);

  // link the comment to the post
  await Post.findByIdAndUpdate(postId, {
    $push: { comments: comment._id },
  });

  // create notification if not commenting on own post
  if (post.user.toString() !== user._id.toString()) {
    console.log("Creating notification for comment...");
    try {
      const notification = await Notification.create({
        from: user._id,
        to: post.user,
        type: "comment",
        post: postId,
        comment: comment._id,
      });
      console.log("Notification created:", notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      return res.status(500).json({ error: "Failed to create notification" });
    }
  } else {
    console.log("No notification created (user commented on own post)");
  }

  res.status(201).json({ comment });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { commentId } = req.params;

  console.log(`Deleting commentId: ${commentId}, userId: ${userId}`);

  const user = await User.findOne({ clerkId: userId });
  const comment = await Comment.findById(commentId);

  console.log("User:", user);
  console.log("Comment:", comment);

  if (!user || !comment) {
    console.log(
      `User or comment not found - User: ${user}, Comment: ${comment}`
    );
    return res.status(404).json({ error: "User or comment not found" });
  }

  if (comment.user.toString() !== user._id.toString()) {
    console.log("User not authorized to delete comment");
    return res
      .status(403)
      .json({ error: "You can only delete your own comments" });
  }

  // remove comment from post
  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: commentId },
  });

  // delete the comment
  await Comment.findByIdAndDelete(commentId);

  console.log("Comment deleted successfully");
  res.status(200).json({ message: "Comment deleted successfully" });
});

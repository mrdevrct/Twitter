import asyncHandler from "express-async-handler";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { getAuth } from "@clerk/express";
import cloudinary from "../config/cloudinary.js";
import Notification from "../models/notification.model.js";
import Comment from "../models/comment.model.js";

export const getPosts = asyncHandler(async (req, res) => {
  console.log("Fetching all posts...");
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    });

  console.log(`Posts found: ${posts.length}`);
  res.status(200).json({ posts });
});

export const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  console.log(`Fetching post with postId: ${postId}`);
  const post = await Post.findById(postId)
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    });

  if (!post) {
    console.log("Post not found");
    return res.status(404).json({ error: "Post not found" });
  }

  console.log("Post found:", post);
  res.status(200).json({ post });
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;

  console.log(`Fetching posts for username: ${username}`);
  const user = await User.findOne({ username });
  if (!user) {
    console.log("User not found");
    return res.status(404).json({ error: "User not found" });
  }

  console.log("User found:", user);
  const posts = await Post.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    });

  console.log(`Posts found for user: ${posts.length}`);
  res.status(200).json({ posts });
});

export const createPost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { content } = req.body;
  const imageFile = req.file;

  console.log(
    `Creating post for userId: ${userId}, content: ${content}, hasImage: ${!!imageFile}`
  );

  if (!content && !imageFile) {
    console.log("Post content and image are both empty");
    return res
      .status(400)
      .json({ error: "Post must contain either text or image" });
  }

  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    console.log("User not found");
    return res.status(404).json({ error: "User not found" });
  }

  console.log("User found:", user);

  let imageUrl = "";

  // upload image to Cloudinary if provided
  if (imageFile) {
    try {
      // convert buffer to base64 for cloudinary
      const base64Image = `data:${
        imageFile.mimetype
      };base64,${imageFile.buffer.toString("base64")}`;

      console.log("Uploading image to Cloudinary...");
      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "social_media_posts",
        resource_type: "image",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" },
          { format: "auto" },
        ],
      });
      imageUrl = uploadResponse.secure_url;
      console.log("Image uploaded successfully:", imageUrl);
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(400).json({ error: "Failed to upload image" });
    }
  }

  const post = await Post.create({
    user: user._id,
    content: content || "",
    image: imageUrl,
  });

  console.log("Post created:", post);
  res.status(201).json({ post });
});

export const likePost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;

  console.log(`Liking/unliking postId: ${postId}, userId: ${userId}`);

  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);

  console.log("User:", user);
  console.log("Post:", post);

  if (!user || !post) {
    console.log(`User or post not found - User: ${user}, Post: ${post}`);
    return res.status(404).json({ error: "User or post not found" });
  }

  const isLiked = post.likes.includes(user._id);

  if (isLiked) {
    // unlike
    await Post.findByIdAndUpdate(postId, {
      $pull: { likes: user._id },
    });
    console.log("Post unliked");
  } else {
    // like
    await Post.findByIdAndUpdate(postId, {
      $push: { likes: user._id },
    });
    console.log("Post liked");

    // create notification if not liking own post
    if (post.user.toString() !== user._id.toString()) {
      console.log("Creating notification for like...");
      try {
        const notification = await Notification.create({
          from: user._id,
          to: post.user,
          type: "like",
          post: postId,
        });
        console.log("Notification created:", notification);
      } catch (error) {
        console.error("Error creating notification:", error);
        return res.status(500).json({ error: "Failed to create notification" });
      }
    } else {
      console.log("No notification created (user liked own post)");
    }
  }

  res.status(200).json({
    message: isLiked ? "Post unliked successfully" : "Post liked successfully",
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;

  console.log(`Deleting postId: ${postId}, userId: ${userId}`);

  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);

  console.log("User:", user);
  console.log("Post:", post);

  if (!user || !post) {
    console.log(`User or post not found - User: ${user}, Post: ${post}`);
    return res.status(404).json({ error: "User or post not found" });
  }

  if (post.user.toString() !== user._id.toString()) {
    console.log("User not authorized to delete post");
    return res
      .status(403)
      .json({ error: "You can only delete your own posts" });
  }

  // delete all comments on this post
  await Comment.deleteMany({ post: postId });
  console.log("Comments deleted for post");

  // delete the post
  await Post.findByIdAndDelete(postId);
  console.log("Post deleted successfully");

  res.status(200).json({ message: "Post deleted successfully" });
});

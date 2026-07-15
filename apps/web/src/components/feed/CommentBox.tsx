import React, { useState } from "react";
import { useCreateCommentMutation, useCreateReplyMutation } from "../../features/feed/feedQuery.ts";

interface CommentBoxProps {
  postId: string;
  parentId?: string;
}

export default function CommentBox({ postId, parentId }: CommentBoxProps) {
  const [text, setText] = useState("");
  const createCommentMutation = useCreateCommentMutation(postId);
  const createReplyMutation = useCreateReplyMutation(parentId || "", postId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (parentId) {
      createReplyMutation.mutate({ text }, {
        onSuccess: () => setText(""),
      });
    } else {
      createCommentMutation.mutate({ text }, {
        onSuccess: () => setText(""),
      });
    }
  };

  return (
    <div className="_feed_inner_comment_box w-100 mb-2">
      <form className="_feed_inner_comment_box_form d-flex align-items-center w-100 gap-2" onSubmit={handleSubmit}>
        <div className="_feed_inner_comment_box_content d-flex align-items-center flex-grow-1">
          <div className="_feed_inner_comment_box_content_image me-2 flex-shrink-0">
            <img 
              src="/assets/images/comment_img.png" 
              alt="Avatar" 
              className="_comment_img rounded-circle"
              style={{ width: "30px", height: "30px", objectFit: "cover" }}
            />
          </div>
          <div className="_feed_inner_comment_box_content_txt w-100">
            <textarea 
              className="form-control _comment_textarea py-1" 
              placeholder={parentId ? "Write a reply..." : "Write a comment..."}
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ height: "36px", resize: "none" }}
            ></textarea>
          </div>
        </div>
        <button 
          type="submit" 
          className="btn btn-primary btn-sm px-3"
          disabled={!text.trim() || createCommentMutation.isPending || createReplyMutation.isPending}
        >
          Send
        </button>
      </form>
    </div>
  );
}

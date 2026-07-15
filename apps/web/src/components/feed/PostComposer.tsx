import React, { useRef, useState } from "react";
import { useUiStore } from "../../store/uiStore.ts";
import { useCreatePostMutation } from "../../features/feed/feedQuery.ts";
import { useAuthUser } from "../../features/auth/authQuery.ts";
import PostComposerImagePreview from "./PostComposerImagePreview.tsx";
import PostComposerControls from "./PostComposerControls.tsx";

export default function PostComposer() {
  const { data: userResponse } = useAuthUser();
  const currentUser = userResponse?.data;

  const createPostMutation = useCreatePostMutation();

  const { 
    composerDraft, 
    setComposerDraft, 
    optimisticUploadPreview, 
    setOptimisticUploadPreview 
  } = useUiStore();

  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComposerDraft(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setOptimisticUploadPreview(url);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (optimisticUploadPreview) {
      URL.revokeObjectURL(optimisticUploadPreview);
    }
    setOptimisticUploadPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (!composerDraft.trim() && !selectedFile) return;

    const formData = new FormData();
    formData.append("text", composerDraft);
    formData.append("visibility", visibility);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    createPostMutation.mutate(formData, {
      onSuccess: () => {
        setComposerDraft("");
        setSelectedFile(null);
        setOptimisticUploadPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    });
  };

  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
      <div className="_feed_inner_text_area_box d-flex">
        <div className="_feed_inner_text_area_box_image me-3">
          <img 
            src={currentUser?.avatarUrl || "/assets/images/txt_img.png"} 
            alt="User avatar" 
            className="_txt_img rounded-circle" 
            style={{ width: "36px", height: "36px", objectFit: "cover" }}
          />
        </div>
        <div className="form-floating _feed_inner_text_area_box_form w-100 position-relative">
          <textarea 
            className="form-control _textarea border-0 shadow-none ps-0 pt-3" 
            placeholder="Write something ..." 
            id="floatingTextarea"
            value={composerDraft}
            onChange={handleTextChange}
            disabled={createPostMutation.isPending}
            style={{ minHeight: "80px", resize: "none" }}
          ></textarea>
          {!composerDraft && (
            <label className="_feed_textarea_label ps-0 pt-3" htmlFor="floatingTextarea">
              Write something ...
            </label>
          )}
        </div>
      </div>

      {/* Optimistic Image Preview */}
      {optimisticUploadPreview && (
        <PostComposerImagePreview 
          previewUrl={optimisticUploadPreview} 
          onRemove={handleRemoveImage} 
        />
      )}

      {/* Composer Controls */}
      <PostComposerControls 
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        visibility={visibility}
        onVisibilityChange={setVisibility}
        isPending={createPostMutation.isPending}
        canPost={!!(composerDraft.trim() || selectedFile)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { getCourseById } from "../data/apCourses";

const MAX_UPLOAD_SIZE = 25 * 1024 * 1024; // 25 MB

export default function CourseOptions({ userProfile, onSelectCourse }) {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const course = getCourseById(courseId);

  const [essayResponse, setEssayResponse] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [essayAttachment, setEssayAttachment] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const essayFileInputRef = useRef(null);
  const uploadInputRef = useRef(null);

  useEffect(() => {
    if (course && onSelectCourse) {
      onSelectCourse(course, { persist: false });
    }
  }, [course, onSelectCourse]);

  if (!course) {
    return (
      <section style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>Course not found</h1>
          <p style={styles.subtitle}>
            We couldn’t find the AP course you were looking for. Head back and
            pick another course.
          </p>
        </div>
        <div style={styles.actions}>
          <button style={styles.secondaryButton} onClick={() => navigate("/courses")}>
            Back to Courses
          </button>
          <button style={styles.primaryButton} onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>
        </div>
      </section>
    );
  }

  const submissionCollection = userProfile?.uid
    ? collection(db, "users", userProfile.uid, "submissions")
    : null;

  const uploadAttachment = async (file) => {
    if (!file) return null;
    if (!storage) {
      throw new Error("File storage is not configured.");
    }
    if (!userProfile?.uid) {
      throw new Error("You need to be logged in to upload files.");
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      throw new Error("Uploads must be 25 MB or smaller.");
    }

    const normalizedName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]+/g, "-")
      .replace(/-+/g, "-");
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const path = `users/${userProfile.uid}/submissions/${course.id}/${uniqueSuffix}-${normalizedName}`;
    const fileReference = storageRef(storage, path);
    await uploadBytes(fileReference, file);
    const downloadURL = await getDownloadURL(fileReference);

    return {
      name: file.name,
      size: file.size,
      type: file.type,
      storagePath: path,
      downloadURL,
    };
  };

  const handleEssaySubmit = async () => {
    if (!submissionCollection) {
      setStatusMessage("You need to be logged in to submit work.");
      return;
    }

    const trimmedEssay = essayResponse.trim();
    if (!trimmedEssay && !essayAttachment) {
      setStatusMessage("Add your response or attach an image before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      let attachmentMeta = null;
      if (essayAttachment) {
        attachmentMeta = await uploadAttachment(essayAttachment);
      }

      const wordCount = trimmedEssay
        ? trimmedEssay.split(/\s+/).filter(Boolean).length
        : 0;

      await addDoc(submissionCollection, {
        courseId: course.id,
        courseName: course.name,
        submissionType: "essay",
        submissionFormat: attachmentMeta
          ? trimmedEssay
            ? "hybrid"
            : "image-only"
          : "text",
        essay: trimmedEssay || null,
        wordCount,
        attachments: attachmentMeta ? [attachmentMeta] : [],
        storagePath: attachmentMeta?.storagePath ?? null,
        downloadURL: attachmentMeta?.downloadURL ?? null,
        createdAt: serverTimestamp(),
        reviewStatus: "pending-ai-feedback",
      });

      setEssayResponse("");
      setEssayAttachment(null);
      if (essayFileInputRef.current) {
        essayFileInputRef.current.value = "";
      }

      setStatusMessage(
        attachmentMeta
          ? "Saved! Your typed response and image are ready for upcoming rubric grading."
          : "Saved! AI scoring with the official rubric is coming soon."
      );
    } catch (err) {
      console.error("Failed to save essay submission", err);
      setStatusMessage(
        err?.message ?? "We couldn't save that right now. Try again in a minute."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSubmit = async () => {
    if (!submissionCollection) {
      setStatusMessage("You need to be logged in to submit work.");
      return;
    }
    if (!selectedFile) {
      setStatusMessage("Select a file or image before submitting.");
      return;
    }
    if (selectedFile.size > MAX_UPLOAD_SIZE) {
      setStatusMessage("Uploads must be 25 MB or smaller.");
      return;
    }

    setIsSubmitting(true);
    try {
      const attachmentMeta = await uploadAttachment(selectedFile);

      await addDoc(submissionCollection, {
        courseId: course.id,
        courseName: course.name,
        submissionType: "file-upload",
        attachments: attachmentMeta ? [attachmentMeta] : [],
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        storagePath: attachmentMeta?.storagePath ?? null,
        downloadURL: attachmentMeta?.downloadURL ?? null,
        createdAt: serverTimestamp(),
        reviewStatus: "pending-ai-feedback",
      });

      setSelectedFile(null);
      if (uploadInputRef.current) {
        uploadInputRef.current.value = "";
      }

      setStatusMessage("Upload saved! AI rubric grading is coming soon.");
    } catch (err) {
      console.error("Failed to save upload", err);
      setStatusMessage(
        err?.message ?? "We couldn't capture that upload. Try again shortly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEssayFlow = course.submissionMode === "essay";

  return (
    <section style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Course workspace</p>
          <h1 style={styles.title}>{course.name}</h1>
          <p style={styles.subtitle}>
            Choose how you want to train today. Multiple choice pulls fresh
            questions from the CED. FRQ / Essay submissions will be graded with
            College Board rubrics once AI scoring is plugged in.
          </p>
        </div>
        <button style={styles.secondaryButton} onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Practice MCQs</h2>
          <p style={styles.cardBody}>
            Launch adaptive multiple-choice practice aligned with the course’s
            CED units. Item difficulty adapts as you answer.
          </p>
          <button
            style={styles.primaryButton}
            onClick={() => navigate(`/practice/${course.id}`)}
          >
            Start Multiple Choice Practice
          </button>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Submit FRQ / Essay</h2>
          <p style={styles.cardBody}>
            {isEssayFlow
              ? "Paste your typed response and optionally attach a photo of handwritten work. We’ll store it and soon route it through rubric-based AI graders."
              : "Upload images or PDFs of your written work. We’ll keep a record so you can request AI review when it’s ready."}
          </p>

          {isEssayFlow ? (
            <>
              <textarea
                value={essayResponse}
                onChange={(e) => {
                  setEssayResponse(e.target.value);
                  if (statusMessage) setStatusMessage("");
                }}
                placeholder="Paste or type your essay/response here..."
                style={styles.textarea}
                rows={8}
              />
              <div style={styles.attachmentStack}>
                <label style={styles.uploadLabel}>
                  <input
                    ref={essayFileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    style={styles.fileInput}
                    onChange={(e) => {
                      setEssayAttachment(e.target.files?.[0] ?? null);
                      if (statusMessage) setStatusMessage("");
                    }}
                  />
                  <span>
                    {essayAttachment
                      ? `Attached: ${essayAttachment.name}`
                      : "Attach a work image (optional)"}
                  </span>
                </label>
                {essayAttachment && (
                  <button
                    type="button"
                    style={styles.removeAttachment}
                    onClick={() => {
                      setEssayAttachment(null);
                      if (essayFileInputRef.current) {
                        essayFileInputRef.current.value = "";
                      }
                    }}
                  >
                    Remove attachment
                  </button>
                )}
                <p style={styles.attachmentHint}>
                  Supports PDF, PNG, JPG up to 25 MB.
                </p>
              </div>
              <button
                style={styles.primaryButton}
                onClick={handleEssaySubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Submit for Grading"}
              </button>
            </>
          ) : (
            <>
              <label style={styles.uploadLabel}>
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  style={styles.fileInput}
                  onChange={(e) => {
                    setSelectedFile(e.target.files?.[0] ?? null);
                    if (statusMessage) setStatusMessage("");
                  }}
                />
                <span>
                  {selectedFile
                    ? `Selected: ${selectedFile.name}`
                    : "Upload your FRQ or work image"}
                </span>
              </label>
              {selectedFile && (
                <button
                  type="button"
                  style={styles.removeAttachment}
                  onClick={() => {
                    setSelectedFile(null);
                    if (uploadInputRef.current) {
                      uploadInputRef.current.value = "";
                    }
                  }}
                >
                  Remove file
                </button>
              )}
              <p style={styles.attachmentHint}>
                Supports PDF, PNG, JPG up to 25 MB.
              </p>
              <button
                style={styles.primaryButton}
                onClick={handleUploadSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Submit for Grading"}
              </button>
            </>
          )}

          <p style={styles.helperText}>
            AI scoring isn’t live yet. Submissions land in Firestore so you’ll
            have a trail once the GPT/Claude graders are hooked in.
          </p>
        </div>
      </div>

      {statusMessage && <p style={styles.status}>{statusMessage}</p>}

      <div style={styles.actions}>
        <button style={styles.secondaryButton} onClick={() => navigate("/courses")}>
          Explore more courses
        </button>
        <button style={styles.primaryButton} onClick={() => navigate("/dashboard")}>
          Return Home
        </button>
      </div>
    </section>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    maxWidth: "960px",
    margin: "0 auto",
    backgroundColor: "#FFFFFF",
    borderRadius: "1.25rem",
    padding: "2.75rem 3rem",
    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1.5rem",
    flexWrap: "wrap",
  },
  eyebrow: {
    margin: 0,
    fontSize: "0.85rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#64748B",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#0F172A",
    margin: "0.25rem 0",
  },
  subtitle: {
    fontSize: "1.05rem",
    color: "#475569",
    margin: 0,
    lineHeight: 1.6,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "#F8FAFC",
    borderRadius: "1rem",
    padding: "1.75rem",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#0F172A",
    margin: 0,
  },
  cardBody: {
    fontSize: "1rem",
    color: "#475569",
    margin: 0,
    lineHeight: 1.6,
  },
  primaryButton: {
    alignSelf: "flex-start",
    padding: "0.85rem 1.75rem",
    backgroundColor: "#0078C8",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "0.85rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "0.85rem 1.5rem",
    backgroundColor: "#E2E8F0",
    color: "#0F172A",
    border: "none",
    borderRadius: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    borderRadius: "0.75rem",
    border: "1px solid rgba(15,23,42,0.12)",
    padding: "1rem",
    fontSize: "1rem",
    lineHeight: 1.6,
    resize: "vertical",
    minHeight: "220px",
  },
  uploadLabel: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    border: "1px dashed rgba(15,23,42,0.2)",
    borderRadius: "0.85rem",
    padding: "1rem 1.25rem",
    cursor: "pointer",
    backgroundColor: "#FFFFFF",
  },
  fileInput: {
    display: "none",
  },
  attachmentStack: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  removeAttachment: {
    alignSelf: "flex-start",
    background: "transparent",
    border: "none",
    color: "#EF4444",
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
  },
  attachmentHint: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#64748B",
  },
  helperText: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#64748B",
  },
  status: {
    margin: 0,
    fontSize: "0.95rem",
    color: "#0F172A",
    backgroundColor: "#F1F5F9",
    borderRadius: "0.75rem",
    padding: "0.85rem 1.1rem",
  },
  actions: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
};

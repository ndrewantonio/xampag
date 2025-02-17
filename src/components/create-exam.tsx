import React, { useState } from "react";
import * as Form from "@radix-ui/react-form";
import * as RadioGroup from "@radix-ui/react-radio-group";
import * as Toast from "@radix-ui/react-toast";
import * as Dialog from "@radix-ui/react-dialog";
import { Trash2, X } from "lucide-react";
import { supabase } from "../config/supabase";

type Question = {
  id: number;
  text: string;
  options: string[];
  correctOption: number;
  points: number;
};

type ExamSettings = {
  inviteCode: string;
  isPaid: boolean;
  price?: number;
};

// Enhanced Button component
const Button = ({ children, variant = "default", size = "default", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
}) => {
  const baseStyles = "rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50";
  const variantStyles = {
    default: "bg-blue-500 hover:bg-blue-600 text-white",
    outline: "border border-gray-300 hover:bg-gray-50",
    ghost: "hover:bg-gray-100"
  };
  const sizeStyles = {
    default: "px-4 py-2",
    sm: "px-2 py-1 text-sm",
    icon: "p-1"
  };

  return (
    <button
      {...props}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${props.className || ""}`}
    >
      {children}
    </button>
  );
};

export function ExamForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, title: "", description: "", variant: "default" });
  const [examSettings, setExamSettings] = useState<ExamSettings>({
    inviteCode: "",
    isPaid: false,
    price: 0,
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const showToast = (title: string, description: string, variant: "default" | "error" = "default") => {
    setToast({ open: true, title, description, variant });
    setTimeout(() => setToast(prev => ({ ...prev, open: false })), 3000);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        text: "",
        options: ["", "", "", ""],
        correctOption: 0,
        points: 1
      }
    ]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: number, field: keyof Question, value: string | number) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId: number, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const addOption = (questionId: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options.length < 6) {
        return { ...q, options: [...q.options, ""] };
      }
      return q;
    }));
  };

  const removeOption = (questionId: number, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options.length > 2) {
        const newOptions = q.options.filter((_, index) => index !== optionIndex);
        const newCorrectOption = q.correctOption >= optionIndex ?
          Math.max(0, q.correctOption - 1) : q.correctOption;
        return { ...q, options: newOptions, correctOption: newCorrectOption };
      }
      return q;
    }));
  };

  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setExamSettings(prev => ({ ...prev, inviteCode: code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Error", "Please enter an exam title", "error");
      return;
    }

    if (questions.length === 0) {
      showToast("Error", "Please add at least one question", "error");
      return;
    }

    if (!examSettings.inviteCode) {
      setShowSettingsModal(true);
      return;
    }

    const invalidQuestions = questions.some(q =>
      !q.text.trim() || q.options.some(opt => !opt.trim())
    );

    if (invalidQuestions) {
      showToast("Error", "Please fill in all questions and options", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("exams")
        .insert([{
          title,
          description,
          questions: JSON.stringify(questions),
          total_points: questions.reduce((sum, q) => sum + q.points, 0),
          invite_code: examSettings.inviteCode,
          is_paid: examSettings.isPaid,
          price: examSettings.isPaid ? examSettings.price : 0
        }]);

      if (error) throw error;

      showToast("Success", "Exam created successfully");

      // Reset form
      setTitle("");
      setDescription("");
      setQuestions([]);
      setExamSettings({
        inviteCode: "",
        isPaid: false,
        price: 0,
      });
    } catch (error) {
      showToast("Error", "Failed to create exam. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Toast.Provider>
        <Form.Root onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 border rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-bold mb-6">Create New Exam</h2>

            <Form.Field name="title">
              <Form.Label className="block text-sm font-medium mb-1">Exam Title</Form.Label>
              <Form.Control asChild>
                <input
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter exam title"
                />
              </Form.Control>
            </Form.Field>

            <Form.Field name="description">
              <Form.Label className="block text-sm font-medium mb-1">Description</Form.Label>
              <Form.Control asChild>
                <input
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter exam description"
                />
              </Form.Control>
            </Form.Field>
          </div>

          {questions.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
              No questions added yet. Click "Add Question" to begin creating your exam.
            </div>
          )}

          {questions.map((question, index) => (
            <div key={question.id} className="border rounded-lg p-6 bg-white relative">
              <div className="absolute right-4 top-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <Form.Field className="flex-grow" name={`question-${question.id}`}>
                    <Form.Label className="block text-sm font-medium mb-1">
                      Question {index + 1}
                    </Form.Label>
                    <Form.Control asChild>
                      <input
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                        placeholder="Enter question text"
                      />
                    </Form.Control>
                  </Form.Field>

                  <Form.Field className="w-24" name={`points-${question.id}`}>
                    <Form.Label className="block text-sm font-medium mb-1">Points</Form.Label>
                    <Form.Control asChild>
                      <input
                        type="number"
                        min="1"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={question.points}
                        onChange={(e) => updateQuestion(question.id, "points", parseInt(e.target.value) || 1)}
                      />
                    </Form.Control>
                  </Form.Field>
                </div>

                <RadioGroup.Root
                  className="space-y-2"
                  value={question.correctOption.toString()}
                  onValueChange={(value) => updateQuestion(question.id, "correctOption", parseInt(value))}
                >
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <RadioGroup.Item
                        className="w-4 h-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={optionIndex.toString()}
                        id={`q${question.id}-o${optionIndex}`}
                      >
                        <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-blue-500" />
                      </RadioGroup.Item>
                      <input
                        className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={option}
                        onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      {question.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => removeOption(question.id, optionIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </RadioGroup.Root>

                {question.options.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addOption(question.id)}
                    className="mt-2"
                  >
                    Add Option
                  </Button>
                )}
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <Button type="button" onClick={addQuestion} variant="outline">
              Add Question
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Exam"}
            </Button>
          </div>

          <Dialog.Root open={showSettingsModal} onOpenChange={setShowSettingsModal}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[400px] space-y-4">
                <div className="flex justify-between items-center">
                  <Dialog.Title className="text-lg font-medium">
                    Exam Settings
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="text-gray-400 hover:text-gray-500">
                      <X className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Invite Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={examSettings.inviteCode}
                        onChange={(e) => setExamSettings(prev => ({ ...prev, inviteCode: e.target.value }))}
                        placeholder="Enter invite code"
                      />
                      <Button type="button" onClick={generateInviteCode}>
                        Generate
                      </Button>
                    </div>
                  </div>

                  <div>
                    <RadioGroup.Root
                      className="space-y-2"
                      value={examSettings.isPaid ? "paid" : "free"}
                      onValueChange={(value) => setExamSettings(prev => ({
                        ...prev,
                        isPaid: value === "paid",
                        price: value === "free" ? 0 : prev.price
                      }))}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroup.Item
                          className="w-4 h-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value="free"
                          id="exam-type-free"
                        >
                          <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-blue-500" />
                        </RadioGroup.Item>
                        <label htmlFor="exam-type-free">Free</label>
                      </div>

                      <div className="flex items-center gap-2">
                        <RadioGroup.Item
                          className="w-4 h-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value="paid"
                          id="exam-type-paid"
                        >
                          <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-blue-500" />
                        </RadioGroup.Item>
                        <label htmlFor="exam-type-paid">Paid</label>
                      </div>
                    </RadioGroup.Root>
                  </div>

                  {examSettings.isPaid && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={examSettings.price}
                        onChange={(e) => setExamSettings(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        placeholder="Enter price"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <Dialog.Close asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <Dialog.Close asChild>
                      <Button type="submit" onClick={(e) => {
                        e.preventDefault();
                        if (!examSettings.inviteCode) {
                          showToast("Error", "Please enter an invite code", "error");
                          return;
                        }
                        if (examSettings.isPaid && (!examSettings.price || examSettings.price <= 0)) {
                          showToast("Error", "Please enter a valid price", "error");
                          return;
                        }
                        setShowSettingsModal(false);
                        handleSubmit(e);
                      }}>
                        Confirm
                      </Button>
                    </Dialog.Close>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

        </Form.Root>

        <Toast.Provider>
          <Toast.Root
            open={toast.open}
            onOpenChange={(open) => setToast(prev => ({ ...prev, open }))}
            className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${toast.variant === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
              }`}
          >
            <Toast.Title className="font-medium">{toast.title}</Toast.Title>
            <Toast.Description>{toast.description}</Toast.Description>
          </Toast.Root>
          <Toast.Viewport />
        </Toast.Provider>
      </Toast.Provider>
    </div>
  );
}

export default ExamForm;
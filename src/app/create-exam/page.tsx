'use client'

import { ExamForm } from '@/components/create-exam'

export default function CreateExamPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Create New Exam</h1>
      <ExamForm />
    </div>
  )
}
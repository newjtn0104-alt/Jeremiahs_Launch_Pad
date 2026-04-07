// Simple in-memory storage for inventory submissions
// Replace with database when Prisma is set up

interface InventorySubmission {
  id: string;
  itemName: string;
  count: number;
  submissionId: string;
  formId: string;
  respondedAt: Date;
  createdAt: Date;
}

// In-memory storage (will reset on server restart)
const submissions: InventorySubmission[] = [];

export function addSubmission(submission: Omit<InventorySubmission, 'id' | 'createdAt'>) {
  const newSubmission: InventorySubmission = {
    ...submission,
    id: Math.random().toString(36).substring(7),
    createdAt: new Date(),
  };
  submissions.push(newSubmission);
  return newSubmission;
}

export function getSubmissions(): InventorySubmission[] {
  return submissions;
}

export function getSubmissionsBySubmissionId(submissionId: string): InventorySubmission[] {
  return submissions.filter(s => s.submissionId === submissionId);
}

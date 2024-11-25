export type Purchase = {
  _id: string;
  uploaderName: string;
  vendorName: string;
  purpose: 'Procurement' | 'Salary' | 'Repair' | 'Small Purchase';
  amount: number;
  fileUrl: string;
  fileName: string;
  status: 'pending' | 'director_approved' | 'finance_approved' | 'rejected';
  createdAt: Date;
  paymentDate: Date;
  paymentSequence: 'payment_first' | 'bill_first' | 'payment_without_bill';
  billType: 'quantum' | 'covalent';
  hub: 'mumbai' | 'delhi' | 'bangalore' | 'pune';
  directorApproval: {
    approved: boolean;
    date: Date;
  } | null;
  financeApproval: {
    approved: boolean;
    date: Date;
  } | null;
};
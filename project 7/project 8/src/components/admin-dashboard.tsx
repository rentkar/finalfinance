import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Search, FileText, CheckCircle, XCircle, Download } from 'lucide-react';
import { usePurchaseStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { format } from 'date-fns';
import type { Purchase } from '@/lib/types';

const formatIndianCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

export function AdminDashboard() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [reuploadingFor, setReuploadingFor] = useState<string | null>(null);
  
  const { purchases, fetchPurchases, updatePurchaseStatus, reuploadBill } = usePurchaseStore();
  const { userRole } = useAuthStore();

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleStatusChange = async (
    purchaseId: string, 
    status: Purchase['status'],
    approvalType?: 'director' | 'finance'
  ) => {
    try {
      await updatePurchaseStatus(purchaseId, status, approvalType);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleReupload = async (purchaseId: string, file: File) => {
    try {
      const fileUrl = URL.createObjectURL(file);
      await reuploadBill(purchaseId, fileUrl, file.name);
      setReuploadingFor(null);
    } catch (error) {
      console.error('Failed to reupload bill:', error);
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.uploaderName.toLowerCase().includes(search.toLowerCase()) ||
      purchase.vendorName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || purchase.status === filter;
    
    if (selectedMonth === 'all') return matchesSearch && matchesFilter;

    const purchaseDate = new Date(purchase.createdAt);
    const [year, month] = selectedMonth.split('-').map(Number);
    return (
      matchesSearch &&
      matchesFilter &&
      purchaseDate.getFullYear() === year &&
      purchaseDate.getMonth() === month
    );
  });

  const stats = {
    total: filteredPurchases.length,
    pending: filteredPurchases.filter(p => p.status === 'pending').length,
    directorApproved: filteredPurchases.filter(p => p.status === 'director_approved').length,
    financeApproved: filteredPurchases.filter(p => p.status === 'finance_approved').length,
    rejected: filteredPurchases.filter(p => p.status === 'rejected').length,
    totalAmount: filteredPurchases.reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <Card className="w-full p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="p-4 bg-white">
          <p className="text-sm text-muted-foreground">Total Requests</p>
          <h3 className="text-2xl font-bold">{stats.total}</h3>
        </Card>
        <Card className="p-4 bg-yellow-50">
          <p className="text-sm text-yellow-600">Pending</p>
          <h3 className="text-2xl font-bold text-yellow-700">{stats.pending}</h3>
        </Card>
        <Card className="p-4 bg-blue-50">
          <p className="text-sm text-blue-600">Director Approved</p>
          <h3 className="text-2xl font-bold text-blue-700">{stats.directorApproved}</h3>
        </Card>
        <Card className="p-4 bg-green-50">
          <p className="text-sm text-green-600">Finance Approved</p>
          <h3 className="text-2xl font-bold text-green-700">{stats.financeApproved}</h3>
        </Card>
        <Card className="p-4 bg-red-50">
          <p className="text-sm text-red-600">Rejected</p>
          <h3 className="text-2xl font-bold text-red-700">{stats.rejected}</h3>
        </Card>
        <Card className="p-4 bg-purple-50">
          <p className="text-sm text-purple-600">Total Amount</p>
          <h3 className="text-xl font-bold text-purple-700">{formatIndianCurrency(stats.totalAmount)}</h3>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="director_approved">Director Approved</SelectItem>
            <SelectItem value="finance_approved">Finance Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Uploader</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Hub</TableHead>
              <TableHead>Bill Type</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.map((purchase) => (
              <TableRow key={purchase._id}>
                <TableCell>{format(new Date(purchase.createdAt), 'PP')}</TableCell>
                <TableCell>{purchase.uploaderName}</TableCell>
                <TableCell>{purchase.vendorName}</TableCell>
                <TableCell>{purchase.purpose}</TableCell>
                <TableCell>{formatIndianCurrency(purchase.amount)}</TableCell>
                <TableCell className="capitalize">{purchase.hub}</TableCell>
                <TableCell className="capitalize">{purchase.billType}</TableCell>
                <TableCell>{format(new Date(purchase.paymentDate), 'PP')}</TableCell>
                <TableCell>
                  {purchase.fileUrl && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={purchase.fileUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4 mr-2" />
                        View
                      </a>
                    </Button>
                  )}
                  {userRole && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReuploadingFor(purchase._id)}
                    >
                      Reupload
                    </Button>
                  )}
                  {reuploadingFor === purchase._id && (
                    <Input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleReupload(purchase._id, file);
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${purchase.status === 'finance_approved' ? 'bg-green-100 text-green-800' :
                      purchase.status === 'director_approved' ? 'bg-blue-100 text-blue-800' :
                      purchase.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                    {purchase.status.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                </TableCell>
                <TableCell>
                  {userRole === 'director' && purchase.amount >= 10000 && !purchase.directorApproval?.approved && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 hover:text-blue-700"
                      onClick={() => handleStatusChange(purchase._id, 'director_approved', 'director')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Director
                    </Button>
                  )}
                  {userRole === 'finance' && (
                    (purchase.amount < 10000 || purchase.directorApproval?.approved) && 
                    !purchase.financeApproval?.approved && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleStatusChange(purchase._id, 'finance_approved', 'finance')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Finance
                      </Button>
                    )
                  )}
                  {(userRole === 'director' || userRole === 'finance') && 
                   !purchase.financeApproval?.approved && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleStatusChange(purchase._id, 'rejected')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
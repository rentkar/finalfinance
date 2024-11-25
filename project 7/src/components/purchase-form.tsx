import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { usePurchaseStore } from '@/lib/store';
import type { Purchase } from '@/lib/types';
import { Upload } from 'lucide-react';

export function PurchaseForm() {
  const addPurchase = usePurchaseStore((state) => state.addPurchase);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [paymentDate, setPaymentDate] = useState('');
  const [formData, setFormData] = useState({
    uploaderName: '',
    vendorName: '',
    purpose: '',
    paymentSequence: '',
    amount: '',
    billType: '',
    hub: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fileUrl = file ? URL.createObjectURL(file) : '';
      
      await addPurchase({
        uploaderName: formData.uploaderName,
        vendorName: formData.vendorName,
        purpose: formData.purpose as Purchase['purpose'],
        paymentSequence: formData.paymentSequence as Purchase['paymentSequence'],
        billType: formData.billType as Purchase['billType'],
        hub: formData.hub as Purchase['hub'],
        amount: parseFloat(formData.amount),
        fileName: file?.name || '',
        fileUrl,
        paymentDate: new Date(paymentDate),
      });

      // Reset form
      setFormData({
        uploaderName: '',
        vendorName: '',
        purpose: '',
        paymentSequence: '',
        amount: '',
        billType: '',
        hub: '',
      });
      setFile(null);
      setPaymentDate('');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Failed to submit purchase:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="uploaderName">Uploader Name</Label>
          <Input
            id="uploaderName"
            required
            placeholder="Enter your name"
            disabled={loading}
            value={formData.uploaderName}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendorName">Vendor Name</Label>
          <Input
            id="vendorName"
            required
            placeholder="Enter vendor name"
            disabled={loading}
            value={formData.vendorName}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">Purpose</Label>
          <Select 
            required 
            disabled={loading}
            value={formData.purpose}
            onValueChange={(value) => handleSelectChange('purpose', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Procurement">Procurement</SelectItem>
              <SelectItem value="Salary">Salary</SelectItem>
              <SelectItem value="Repair">Repair</SelectItem>
              <SelectItem value="Small Purchase">Small Purchase</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hub">Hub Location</Label>
          <Select 
            required 
            disabled={loading}
            value={formData.hub}
            onValueChange={(value) => handleSelectChange('hub', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select hub location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mumbai">Mumbai</SelectItem>
              <SelectItem value="delhi">Delhi</SelectItem>
              <SelectItem value="bangalore">Bangalore</SelectItem>
              <SelectItem value="pune">Pune</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="billType">Bill Type</Label>
          <Select 
            required 
            disabled={loading}
            value={formData.billType}
            onValueChange={(value) => handleSelectChange('billType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select bill type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quantum">Quantum</SelectItem>
              <SelectItem value="covalent">Covalent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentDate">Payment Date</Label>
          <Input
            id="paymentDate"
            type="date"
            required
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentSequence">Payment Sequence</Label>
          <Select 
            required 
            disabled={loading}
            value={formData.paymentSequence}
            onValueChange={(value) => handleSelectChange('paymentSequence', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment sequence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payment_first">Payment First, Bill Later</SelectItem>
              <SelectItem value="bill_first">Bill First, Payment Later</SelectItem>
              <SelectItem value="payment_without_bill">Payment Without Bill</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            required
            min="0"
            step="0.01"
            placeholder="Enter amount in rupees"
            disabled={loading}
            value={formData.amount}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">Upload File</Label>
          <Input
            id="file"
            type="file"
            required={formData.paymentSequence !== 'payment_without_bill'}
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            disabled={loading}
          />
          {file && (
            <p className="text-sm text-muted-foreground">
              Selected file: {file.name}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            'Submitting...'
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Submit Purchase
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
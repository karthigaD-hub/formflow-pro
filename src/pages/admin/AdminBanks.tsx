import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import type { Bank } from '@/types';

// Bank logos (sample URLs - in production these would be actual bank logos)
const bankLogos = [
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&h=100&fit=crop',
];

export default function AdminBanks() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    description: '',
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    setIsLoading(true);
    try {
      const response = await api.getBanks();
      if (response.success && response.data) {
        setBanks(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load banks',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (bank?: Bank) => {
    if (bank) {
      setSelectedBank(bank);
      setFormData({
        name: bank.name,
        logo: bank.logo,
        description: bank.description || '',
        isActive: bank.isActive,
      });
    } else {
      setSelectedBank(null);
      setFormData({
        name: '',
        logo: bankLogos[Math.floor(Math.random() * bankLogos.length)],
        description: '',
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Bank name is required',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      let response;
      if (selectedBank) {
        response = await api.updateBank(selectedBank.id, formData);
      } else {
        response = await api.createBank(formData);
      }

      if (response.success) {
        toast({
          title: selectedBank ? 'Bank updated' : 'Bank created',
          description: `${formData.name} has been ${selectedBank ? 'updated' : 'created'} successfully`,
        });
        setIsDialogOpen(false);
        loadBanks();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save bank',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBank) return;

    try {
      const response = await api.deleteBank(selectedBank.id);
      if (response.success) {
        toast({
          title: 'Bank deleted',
          description: `${selectedBank.name} has been deleted`,
        });
        setIsDeleteDialogOpen(false);
        loadBanks();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete bank',
        variant: 'destructive',
      });
    }
  };

  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Banks</h1>
          <p className="text-muted-foreground">Manage partner banks and their insurance sections</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="btn-gradient">
          <Plus className="h-4 w-4 mr-2" />
          Add Bank
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search banks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Banks Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredBanks.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBanks.map((bank) => (
            <Card key={bank.id} className="group card-hover">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                    <img
                      src={bank.logo}
                      alt={bank.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold truncate">{bank.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {bank.description || 'No description'}
                        </p>
                      </div>
                      <div
                        className={`h-2 w-2 rounded-full mt-2 ${
                          bank.isActive ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(bank)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setSelectedBank(bank);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold mb-1">No banks found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Get started by adding your first bank'}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Bank
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedBank ? 'Edit Bank' : 'Add New Bank'}</DialogTitle>
            <DialogDescription>
              {selectedBank
                ? 'Update the bank details below'
                : 'Enter the details for the new bank'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bank Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter bank name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
              {formData.logo && (
                <div className="mt-2">
                  <img
                    src={formData.logo}
                    alt="Preview"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the bank"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bank</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedBank?.name}"? This will also delete all
              associated sections and questions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

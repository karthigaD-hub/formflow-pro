import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, FileText, CheckCircle, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import type { Bank, Section, FormResponse } from '@/types';

export default function UserDashboard() {
  const { user } = useAuth();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBanks();
  }, []);

  useEffect(() => {
    if (selectedBank) {
      loadSections(selectedBank.id);
    }
  }, [selectedBank]);

  const loadBanks = async () => {
    try {
      const res = await api.getBanks();
      if (res.success && res.data) {
        setBanks(res.data.filter((b) => b.isActive));
      }
    } catch (error) {
      console.error('Error loading banks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSections = async (bankId: string) => {
    try {
      const [sectionsRes, responsesRes] = await Promise.all([
        api.getSections(bankId),
        api.getResponses({ userId: user?.id }),
      ]);
      if (sectionsRes.success && sectionsRes.data) {
        setSections(sectionsRes.data.filter((s) => s.isActive));
      }
      if (responsesRes.success && responsesRes.data) {
        setResponses(responsesRes.data);
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  };

  const getResponseStatus = (sectionId: string) => {
    const response = responses.find((r) => r.sectionId === sectionId);
    if (!response) return null;
    return response.isSubmitted ? 'submitted' : 'in_progress';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground">Select a bank to view and fill insurance forms</p>
      </div>

      {!selectedBank ? (
        <>
          <h2 className="text-xl font-semibold">Select a Bank</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {banks.map((bank) => (
              <Card
                key={bank.id}
                className="cursor-pointer card-hover"
                onClick={() => setSelectedBank(bank)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <img src={bank.logo} alt={bank.name} className="h-16 w-16 rounded-xl object-cover" />
                    <div>
                      <h3 className="font-semibold text-lg">{bank.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{bank.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={selectedBank.logo} alt={selectedBank.name} className="h-12 w-12 rounded-xl object-cover" />
              <div>
                <h2 className="text-xl font-semibold">{selectedBank.name}</h2>
                <p className="text-sm text-muted-foreground">Available forms</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setSelectedBank(null)}>
              Change Bank
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {sections.map((section) => {
              const status = getResponseStatus(section.id);
              return (
                <Card key={section.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{section.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {section.questions?.length || 0} questions
                          </p>
                        </div>
                      </div>
                      {status && (
                        <Badge variant={status === 'submitted' ? 'default' : 'secondary'}>
                          {status === 'submitted' ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Submitted</>
                          ) : (
                            <><Clock className="h-3 w-3 mr-1" /> In Progress</>
                          )}
                        </Badge>
                      )}
                    </div>
                    <Button asChild className="w-full mt-4">
                      <Link to={`/form/${section.id}`}>
                        {status === 'submitted' ? 'View Response' : status === 'in_progress' ? 'Continue' : 'Start Form'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

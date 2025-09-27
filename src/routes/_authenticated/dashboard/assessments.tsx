import { AssessmentList } from '@/components/assessment/assessment-list'
import { AssessmentPreview } from '@/components/assessment/assessment-preview'
import { AssessmentResults } from '@/components/assessment/assessment-results'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import type { Assessment } from '@/types/assessment'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Plus } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/dashboard/assessments')({
  component: RouteComponent,
})

type ViewMode = 'list' | 'builder' | 'preview' | 'take' | 'results';

function RouteComponent() {
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [, setEditingAssessmentId] = useState<string | null>(null);

  const handlePreview = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setCurrentView('preview');
  };

  const handleViewResults = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setCurrentView('results');
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedAssessment(null);
    setEditingAssessmentId(null);
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Assessments</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assessment Management</h1>
            <p className="text-gray-600 mt-2">Create, manage, and deploy assessments for different job positions</p>
          </div>
          <Link
            className="hover:cursor-pointer"
            to="/dashboard/create-assessment"
          >
            <Button>
              <Plus className="w-5 h-5" />
              <span>Create Assessment</span>
            </Button>
          </Link>
        </div>
        {currentView === 'list' && (
          <AssessmentList
            onPreview={handlePreview}
            onViewResults={handleViewResults}
          />
        )}

        {currentView === 'preview' && selectedAssessment && (
          <div>
            <div className="px-6 py-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Assessments</span>
              </button>
            </div>
            <div className="p-6">
              <AssessmentPreview assessment={selectedAssessment} />
            </div>
          </div>
        )}

        {currentView === 'results' && selectedAssessment && (
          <AssessmentResults
            assessment={selectedAssessment}
            onBack={handleBack}
          />
        )}
      </div>
    </>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GraduationCap, User, Briefcase } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <Image
            src="/lern-logo-black.png"
            alt="LERN"
            width={120}
            height={42}
            className="h-auto w-full max-w-[120px] mx-auto"
          />
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Learning Employment Records Network - Choose a role to explore the platform
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Educator Card */}
          <Link href="/learners" className="block">
            <Card className="hover:shadow-lg transition-shadow border-2 hover:border-blue-300 cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Educator</CardTitle>
                <CardDescription className="text-base">Mentors & Program Staff</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• Manage learners in your organization</li>
                  <li>• Create and assign competencies</li>
                  <li>• Provide mentor ratings</li>
                  <li>• Request ratings from learners and masters</li>
                </ul>
                <Button className="w-full" size="lg">
                  Go to Educator Dashboard
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Learner Card */}
          <Link href="/learner" className="block">
            <Card className="hover:shadow-lg transition-shadow border-2 hover:border-green-300 cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Learner</CardTitle>
                <CardDescription className="text-base">Students & Participants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• View your competency ratings</li>
                  <li>• Complete self-assessments</li>
                  <li>• Track your progress over time</li>
                  <li>• Build your skills portfolio</li>
                </ul>
                <Button className="w-full" size="lg" variant="outline">
                  Go to Learner Dashboard
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Master Card */}
          <Link href="/master" className="block">
            <Card className="hover:shadow-lg transition-shadow border-2 hover:border-purple-300 cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Master</CardTitle>
                <CardDescription className="text-base">Industry Experts & Employers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• Review rating requests from educators</li>
                  <li>• Provide expert industry ratings</li>
                  <li>• Search for talent by competency</li>
                  <li>• Validate learner skills</li>
                </ul>
                <Button className="w-full" size="lg" variant="outline">
                  Go to Master Dashboard
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* POC Demo Note */}
        <Card className="border-2 border-amber-300 bg-amber-50">
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                !
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">POC Demo Notes</h3>
                <p className="text-sm text-amber-800 mb-3">
                  This is a proof-of-concept with hardcoded test data and no authentication. The goal is to gather feedback and identify areas for improvement before full development.
                </p>
                <p className="text-sm text-amber-800 mb-2 font-medium">
                  Known limitations in this demo:
                </p>
                <ul className="text-sm text-amber-800 space-y-1 ml-4">
                  <li>• <strong>ABC Data (Attendance/Behavior/Credits)</strong> - No &quot;On Track / Off Track&quot; status indicators for holistic student tracking</li>
                  <li>• <strong>Admin Exports & Reporting</strong> - No SIS export, state reporting, or data export functionality for compliance/integration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

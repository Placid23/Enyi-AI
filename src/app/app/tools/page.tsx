
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, FileText, Languages, Code2, Calculator, Image as ImageIcon, PanelLeftOpen, Lightbulb, Palette } from "lucide-react";
import React from "react";

interface Plugin {
  id: string;
  icon: React.ElementType;
  name: string;
  description: string;
  comingSoon?: boolean;
}

const plugins: Plugin[] = [
  {
    id: 'summarizer',
    icon: FileText,
    name: 'Quick Summarizer',
    description: 'Instantly summarize long texts, articles, or documents to get the key points.',
    comingSoon: true,
  },
  {
    id: 'translator',
    icon: Languages,
    name: 'Language Translator',
    description: 'Translate text between various supported languages with ease.',
    comingSoon: true,
  },
  {
    id: 'code-helper',
    icon: Code2,
    name: 'Code Snippet Helper',
    description: 'Get assistance with common code snippets, syntax, and programming concepts.',
    comingSoon: true,
  },
  {
    id: 'unit-converter',
    icon: Calculator,
    name: 'Unit Converter',
    description: 'Convert between different units of measurement for length, weight, temperature, etc.',
    comingSoon: true,
  },
  {
    id: 'image-optimizer',
    icon: ImageIcon,
    name: 'Image Analyzer',
    description: 'Get insights about uploaded images, such as dominant colors or object detection (conceptual).',
    comingSoon: true,
  },
  {
    id: 'markdown-editor',
    icon: PanelLeftOpen,
    name: 'Markdown Editor',
    description: 'A simple, integrated editor for writing and previewing Markdown content.',
    comingSoon: true,
  },
  {
    id: 'idea-generator',
    icon: Lightbulb,
    name: 'Idea Spark',
    description: 'Brainstorm and generate creative ideas for projects, content, or problem-solving.',
    comingSoon: true,
  },
  {
    id: 'color-palette-generator',
    icon: Palette,
    name: 'Color Palette Generator',
    description: 'Create harmonious color palettes for your design projects based on a seed color or theme.',
    comingSoon: true,
  }
];

export default function ToolsPage() {
  return (
    <div className="flex-grow flex flex-col p-4 md:p-6 space-y-6">
      <Card className="shadow-xl rounded-xl border-border/30 bg-card backdrop-blur-md">
        <CardHeader className="border-b border-border/30 pb-4">
          <div className="flex items-center space-x-3">
            <Wrench className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-semibold">Enyi's Tools & Plugins</CardTitle>
              <CardDescription>
                Explore integrated tools to enhance your productivity and creativity with Enyi.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {plugins.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Tools Available Yet</h3>
              <p className="text-muted-foreground">
                Check back soon for new tools and plugins to enhance Enyi's capabilities!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {plugins.map((plugin) => (
                <Card key={plugin.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                  <CardHeader className="flex flex-row items-start space-x-3 pb-3">
                    <plugin.icon className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <CardTitle className="text-lg font-semibold">{plugin.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="text-sm leading-relaxed">
                      {plugin.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="pt-3">
                    {plugin.comingSoon ? (
                      <Badge variant="outline" className="text-xs border-accent text-accent">Coming Soon</Badge>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full">
                        Explore Tool
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

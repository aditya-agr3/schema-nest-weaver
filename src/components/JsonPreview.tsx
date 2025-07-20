import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface JsonPreviewProps {
  schema: any;
}

export const JsonPreview = ({ schema }: JsonPreviewProps) => {
  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  const getFieldCount = (obj: any): number => {
    if (!obj || typeof obj !== 'object') return 0;
    let count = 0;
    
    const traverse = (item: any) => {
      if (item && typeof item === 'object') {
        if (Array.isArray(item)) {
          item.forEach(traverse);
        } else {
          Object.keys(item).forEach(key => {
            count++;
            traverse(item[key]);
          });
        }
      }
    };
    
    traverse(obj);
    return count;
  };

  const fieldCount = getFieldCount(schema);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">JSON Schema Preview</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {fieldCount} field{fieldCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 h-[calc(100%-5rem)]">
        <ScrollArea className="h-full w-full rounded-md border bg-muted/20 p-4">
          <pre className="text-sm font-mono text-foreground/90 whitespace-pre-wrap break-words">
            {formatJson(schema)}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
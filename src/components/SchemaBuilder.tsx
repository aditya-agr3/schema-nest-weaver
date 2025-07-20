import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Download, Upload, Trash2 } from "lucide-react";
import { SchemaFieldRow, SchemaFormData, SchemaField } from "./SchemaFieldRow";
import { JsonPreview } from "./JsonPreview";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export const SchemaBuilder = () => {
  const { toast } = useToast();
  const { control, watch, setValue, reset } = useForm<SchemaFormData>({
    defaultValues: {
      fields: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields"
  });

  const watchedFields = watch("fields");
  const [jsonSchema, setJsonSchema] = useState<any>({});

  const convertToJsonSchema = (fields: SchemaField[]): any => {
    if (!fields || fields.length === 0) {
      return { type: "object", properties: {} };
    }

    const properties: any = {};
    
    fields.forEach((field) => {
      if (!field.key) return;
      
      switch (field.type) {
        case "string":
          properties[field.key] = { type: "string" };
          break;
        case "number":
          properties[field.key] = { type: "number" };
          break;
        case "nested":
          if (field.nested && field.nested.length > 0) {
            properties[field.key] = convertToJsonSchema(field.nested);
          } else {
            properties[field.key] = { type: "object", properties: {} };
          }
          break;
      }
    });

    return {
      type: "object",
      properties
    };
  };

  useEffect(() => {
    const schema = convertToJsonSchema(watchedFields);
    setJsonSchema(schema);
  }, [watchedFields]);

  const addField = () => {
    append({ key: "", type: "string" });
  };

  const exportSchema = () => {
    const dataStr = JSON.stringify(jsonSchema, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "schema.json";
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Schema exported",
      description: "Your JSON schema has been downloaded successfully.",
    });
  };

  const importSchema = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const schema = JSON.parse(e.target?.result as string);
            // Simple conversion back to form format (basic implementation)
            const fields = Object.entries(schema.properties || {}).map(([key, value]: [string, any]) => ({
              key,
              type: value.type === "object" ? "nested" : value.type,
              nested: value.type === "object" ? [] : undefined
            }));
            setValue("fields", fields as SchemaField[]);
            
            toast({
              title: "Schema imported",
              description: "Your JSON schema has been loaded successfully.",
            });
          } catch (error) {
            toast({
              title: "Import failed",
              description: "Invalid JSON file. Please check the format.",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const clearAll = () => {
    reset({ fields: [] });
    toast({
      title: "Schema cleared",
      description: "All fields have been removed.",
    });
  };

  const fieldCount = fields.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            JSON Schema Builder
          </h1>
          <p className="text-muted-foreground text-lg">
            Build and visualize JSON schemas with an intuitive interface
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Schema Builder Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>Schema Fields</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {fieldCount} field{fieldCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={importSchema}
                      className="text-xs"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Import
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={exportSchema}
                      className="text-xs"
                      disabled={fieldCount === 0}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearAll}
                      className="text-xs hover:bg-destructive hover:text-destructive-foreground"
                      disabled={fieldCount === 0}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
                <Separator />
              </CardHeader>
              
              <CardContent className="space-y-4">
                {fields.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="mb-4">
                      <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                        <Plus className="h-6 w-6" />
                      </div>
                      <p className="text-lg font-medium">No fields yet</p>
                      <p className="text-sm">Start building your schema by adding your first field</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {fields.map((field, index) => (
                      <SchemaFieldRow
                        key={field.id}
                        control={control}
                        index={index}
                        onRemove={() => remove(index)}
                        fieldArrayName="fields"
                      />
                    ))}
                  </div>
                )}
                
                <Button
                  type="button"
                  onClick={addField}
                  className="w-full border-dashed border-2 bg-background hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* JSON Preview Panel */}
          <div className="lg:sticky lg:top-6">
            <JsonPreview schema={jsonSchema} />
          </div>
        </div>
      </div>
    </div>
  );
};
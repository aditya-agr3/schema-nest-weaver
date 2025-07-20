import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Control, useFieldArray, useWatch, Controller } from "react-hook-form";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface SchemaField {
  key: string;
  type: "string" | "number" | "nested";
  nested?: SchemaField[];
}

export interface SchemaFormData {
  fields: SchemaField[];
}

interface SchemaFieldRowProps {
  control: Control<SchemaFormData>;
  index: number;
  onRemove: () => void;
  fieldArrayName: string;
  level?: number;
}

export const SchemaFieldRow = ({ 
  control, 
  index, 
  onRemove, 
  fieldArrayName,
  level = 0 
}: SchemaFieldRowProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const watchedType = useWatch({
    control,
    name: `${fieldArrayName}.${index}.type` as any,
  });

  const nestedFieldArrayName = `${fieldArrayName}.${index}.nested` as const;
  const { fields: nestedFields, append: appendNested, remove: removeNested } = useFieldArray({
    control,
    name: nestedFieldArrayName as any,
  });

  const addNestedField = () => {
    appendNested({ key: "", type: "string" });
  };

  const isNested = watchedType === "nested";
  const hasNestedFields = nestedFields.length > 0;

  return (
    <div className={cn("space-y-3", level > 0 && "ml-6 border-l-2 border-muted pl-4")}>
      <Card className="group hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {isNested && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 shrink-0"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                {...control.register(`${fieldArrayName}.${index}.key` as any)}
                placeholder="Field name (e.g., username)"
                className="transition-colors focus:border-primary"
              />
              
              <div className="flex gap-2">
                <Controller
                  name={`${fieldArrayName}.${index}.type` as any}
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="transition-colors focus:border-primary">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="nested">Nested Object</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRemove}
                  className="shrink-0 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isNested && isExpanded && (
        <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
          {hasNestedFields && (
            <div className="space-y-3">
              {nestedFields.map((field, nestedIndex) => (
                <SchemaFieldRow
                  key={field.id}
                  control={control}
                  index={nestedIndex}
                  onRemove={() => removeNested(nestedIndex)}
                  fieldArrayName={nestedFieldArrayName}
                  level={level + 1}
                />
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={addNestedField}
            className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Nested Field
          </Button>
        </div>
      )}
    </div>
  );
};
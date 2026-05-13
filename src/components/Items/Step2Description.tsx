import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface Step2Props {
  form: UseFormReturn<any>;
}

function CreateListingStep2({ form }: Step2Props) {
  const description = form.watch("description") || "";
  const minChars = 20;
  const maxChars = 2000;

  return (
    <div className="space-y-6">
      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Item Description *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your item in detail. Include condition, features, any defects, original purchase information, etc."
                maxLength={maxChars}
                rows={8}
                {...field}
                className="resize-none text-base"
              />
            </FormControl>
            <div className="flex justify-between items-center">
              <FormDescription>
                {description.length}/{maxChars} characters
              </FormDescription>
              {description.length < minChars && (
                <span className="text-red-500 dark:text-red-400 text-sm">
                  Minimum {minChars} characters required
                </span>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description Tips */}
      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="font-semibold text-sm text-amber-900 dark:text-amber-100 mb-2">
          📝 Write a great description:
        </p>
        <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
          <li>Be honest about condition and any damage</li>
          <li>Include brand, model, size, color, or other relevant specs</li>
          <li>Mention original purchase date if you remember</li>
          <li>Explain why you're selling</li>
          <li>Mention any included accessories or documentation</li>
        </ul>
      </div>

      {/* Preview */}
      {description && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2 uppercase">
            Preview:
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}

export default CreateListingStep2;

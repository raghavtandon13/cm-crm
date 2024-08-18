import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control, Controller, FieldErrors } from "react-hook-form";

export function FormField({
    label,
    name,
    control,
    errors,
    rules,
    type = "text",
    placeholder,
    options,
    className,
}: {
    label: string;
    name: string;
    control: Control<any>;
    errors: FieldErrors;
    rules?: object;
    type?: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
    className?: string;
}) {
    return (
        <div className={`grid gap-2 ${className}`}>
            <Label htmlFor={name}>
                {label}
                {errors[name] && (
                    <span className="m-2 sm:ml-4 bg-red-200 px-1 rounded text-sm text-red-500">
                        {errors[name]?.message as string}
                    </span>
                )}
            </Label>
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field }) =>
                    options ? (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {options.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input id={name} type={type} placeholder={placeholder} className="bg-white" {...field} />
                    )
                }
            />
        </div>
    );
}

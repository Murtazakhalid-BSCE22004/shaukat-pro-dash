import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabaseDoctorsService, type Doctor } from "@/services/supabaseDoctorsService";

type ValueKey = "id" | "name";

interface DoctorSelectProps {
  value: string;
  onChange: (value: string) => void;
  doctors?: Doctor[];
  loading?: boolean;
  placeholder?: string;
  className?: string;
  allowAll?: boolean;
  allLabel?: string;
  allValue?: string;
  valueKey?: ValueKey;
  disabled?: boolean;
}

const getValueFromDoctor = (doctor: Doctor, key: ValueKey): string =>
  key === "name" ? (doctor.name || "") : doctor.id;

const getDoctorByValue = (doctors: Doctor[], value: string, key: ValueKey): Doctor | null => {
  if (!value) return null;
  return (
    doctors.find((d) => getValueFromDoctor(d, key) === value) || null
  );
};

export default function DoctorSelect(props: DoctorSelectProps) {
  const {
    value,
    onChange,
    doctors: doctorsProp,
    loading,
    placeholder = "Select doctor",
    className,
    allowAll = false,
    allLabel = "All Doctors",
    allValue = "all",
    valueKey = "id",
    disabled,
  } = props;

  const [open, setOpen] = React.useState(false);

  const { data: fetchedDoctors = [], isLoading } = useQuery({
    queryKey: ["doctors", "doctor-select", { valueKey }],
    queryFn: supabaseDoctorsService.getAllDoctors,
    enabled: !doctorsProp,
  });

  const doctors = doctorsProp || fetchedDoctors;
  const isBusy = Boolean(loading ?? isLoading);

  const selectedDoctor =
    value && value !== allValue ? getDoctorByValue(doctors, value, valueKey) : null;

  const displayText = (() => {
    if (value === allValue && allowAll) return allLabel;
    if (selectedDoctor) return selectedDoctor.name || "Unknown";
    return placeholder;
  })();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between h-10 border border-gray-300 bg-white text-gray-900",
            "hover:scale-105 hover:shadow-lg hover:border-blue-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200",
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedDoctor ? (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 border border-blue-200">
                <User2 className="h-3.5 w-3.5" />
              </span>
            ) : (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                <User2 className="h-3.5 w-3.5" />
              </span>
            )}
            <span className={cn("truncate text-left", !selectedDoctor && value !== allValue && "text-gray-500")}>{displayText}</span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search doctors..." />
          <CommandList>
            {isBusy ? (
              <div className="p-3 text-sm text-gray-500">Loading...</div>
            ) : (
              <>
                <CommandEmpty>No doctors found.</CommandEmpty>
                <ScrollArea className="max-h-64">
                  <CommandGroup heading="Doctors">
                    {allowAll && (
                      <CommandItem
                        value={allLabel}
                        onSelect={() => {
                          onChange(allValue);
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <span className="mr-2 h-3.5 w-3.5" />
                        <span className="flex-1">{allLabel}</span>
                        {value === allValue ? (
                          <Check className="h-4 w-4 opacity-100" />
                        ) : null}
                      </CommandItem>
                    )}
                    {doctors.map((doctor) => {
                      const val = getValueFromDoctor(doctor, valueKey);
                      const isSelected = value === val;
                      return (
                        <CommandItem
                          key={doctor.id}
                          value={doctor.name || doctor.id}
                          onSelect={() => {
                            onChange(val);
                            setOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <span className="mr-2 h-3.5 w-3.5" />
                          <span className="flex-1 truncate">{doctor.name}</span>
                          {isSelected ? <Check className="h-4 w-4 opacity-100" /> : null}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </ScrollArea>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}



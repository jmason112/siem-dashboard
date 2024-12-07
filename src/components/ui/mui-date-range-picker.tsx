import * as React from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import dayjs from "dayjs";

interface MuiDateRangePickerProps {
  onDateChange: (range: { from: Date; to: Date }) => void;
  className?: string;
}

export function MuiDateRangePicker({
  onDateChange,
  className,
}: MuiDateRangePickerProps) {
  const handleDateChange = (value: any[]) => {
    if (value[0] && value[1]) {
      onDateChange({
        from: value[0].toDate(),
        to: value[1].toDate(),
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["DateRangePicker"]} sx={{ width: "100%" }}>
        <DateRangePicker
          defaultValue={[
            dayjs(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
            dayjs(new Date()),
          ]}
          onChange={handleDateChange}
          slotProps={{
            textField: {
              size: "small",
              sx: {
                "& .MuiInputBase-root": {
                  backgroundColor: "white",
                  ".dark &": {
                    backgroundColor: "rgb(31, 41, 55)",
                  },
                  "&.Mui-focused": {
                    backgroundColor: "white",
                    ".dark &": {
                      backgroundColor: "rgb(31, 41, 55)",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "inherit",
                    ".dark &": {
                      color: "white",
                    },
                  },
                  "& .MuiIconButton-root": {
                    color: "inherit",
                    ".dark &": {
                      color: "white",
                    },
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgb(229, 231, 235)",
                    ".dark &": {
                      borderColor: "rgb(55, 65, 81)",
                    },
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgb(209, 213, 219)",
                    ".dark &": {
                      borderColor: "rgb(75, 85, 99)",
                    },
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgb(37, 99, 235)",
                    ".dark &": {
                      borderColor: "rgb(59, 130, 246)",
                    },
                  },
                },
                "&.MuiFormControl-root": {
                  width: "100%",
                },
                "& .MuiInputLabel-root": {
                  color: "inherit",
                  ".dark &": {
                    color: "white",
                  },
                },
              },
            },
          }}
          sx={{
            width: "100%",
            "& .MuiPickersPopper-root": {
              "& .MuiPaper-root": {
                backgroundColor: "white",
                color: "inherit",
                ".dark &": {
                  backgroundColor: "rgb(17, 24, 39)",
                  color: "white",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.3)",
                },
              },
              "& .MuiDateRangeCalendar-root": {
                backgroundColor: "white",
                ".dark &": {
                  backgroundColor: "rgb(17, 24, 39)",
                },
              },
              "& .MuiPickersCalendarHeader-root": {
                backgroundColor: "white",
                ".dark &": {
                  backgroundColor: "rgb(17, 24, 39)",
                },
              },
              "& .MuiDayCalendar-monthContainer": {
                backgroundColor: "white",
                ".dark &": {
                  backgroundColor: "rgb(17, 24, 39)",
                },
              },
              "& .MuiPickersDay-root": {
                color: "inherit",
                backgroundColor: "white",
                ".dark &": {
                  color: "white",
                  backgroundColor: "rgb(31, 41, 55)",
                },
                "&:hover": {
                  backgroundColor: "rgb(243, 244, 246)",
                  ".dark &": {
                    backgroundColor: "rgb(55, 65, 81)",
                  },
                },
                "&.Mui-selected": {
                  backgroundColor: "rgb(37, 99, 235)",
                  color: "white",
                  ".dark &": {
                    backgroundColor: "rgb(59, 130, 246)",
                    "&:hover": {
                      backgroundColor: "rgb(29, 78, 216)",
                    },
                  },
                },
                "&.MuiPickersDay-today": {
                  borderColor: "rgb(37, 99, 235)",
                  ".dark &": {
                    borderColor: "rgb(59, 130, 246)",
                  },
                },
              },
              "& .MuiDayCalendar-weekDayLabel": {
                color: "rgb(107, 114, 128)",
                ".dark &": {
                  color: "rgb(156, 163, 175)",
                },
              },
              "& .MuiPickersCalendarHeader-label": {
                color: "inherit",
                ".dark &": {
                  color: "white",
                },
              },
              "& .MuiIconButton-root": {
                color: "inherit",
                ".dark &": {
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgb(55, 65, 81)",
                  },
                },
              },
              "& .MuiPickersYear-yearButton": {
                color: "inherit",
                ".dark &": {
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgb(55, 65, 81)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "rgb(59, 130, 246)",
                  },
                },
              },
              "& .MuiPickersMonth-monthButton": {
                color: "inherit",
                ".dark &": {
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgb(55, 65, 81)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "rgb(59, 130, 246)",
                  },
                },
              },
            },
          }}
          className={className}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}

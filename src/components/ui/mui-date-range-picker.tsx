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
            popper: {
              sx: {
                "&.MuiPopper-root": {
                  "& .MuiPaper-root": {
                    backgroundColor: "white",
                    ".dark &": {
                      backgroundColor: "rgb(17, 24, 39)",
                    },
                  },
                  "& .css-1i3tsf3-MuiTypography-root": {
                    color: "rgb(31, 41, 55) !important",
                    ".dark &": {
                      color: "rgb(209, 213, 219) !important",
                    },
                  },
                  "& .MuiTypography-subtitle1": {
                    color: "rgb(31, 41, 55) !important",
                    ".dark &": {
                      color: "rgb(209, 213, 219) !important",
                    },
                  },
                  "& .css-1ckov0h-MuiSvgIcon-root": {
                    color: "rgb(31, 41, 55) !important",
                    ".dark &": {
                      color: "rgb(209, 213, 219) !important",
                    },
                  },
                  "& .MuiPickersArrowSwitcher-rightArrowIcon": {
                    color: "rgb(31, 41, 55) !important",
                    ".dark &": {
                      color: "rgb(209, 213, 219) !important",
                    },
                  },
                  "& .MuiPickersArrowSwitcher-leftArrowIcon": {
                    color: "rgb(31, 41, 55) !important",
                    ".dark &": {
                      color: "rgb(209, 213, 219) !important",
                    },
                  },
                  "& .MuiPickersDay-root": {
                    color: "rgb(55, 65, 81)",
                    fontWeight: 500,
                    ".dark &": {
                      color: "rgb(209, 213, 219)",
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
                      fontWeight: 600,
                      ".dark &": {
                        backgroundColor: "rgb(59, 130, 246)",
                      },
                    },
                    "&.Mui-disabled": {
                      color: "rgb(156, 163, 175)",
                      ".dark &": {
                        color: "rgb(75, 85, 99)",
                      },
                    },
                  },
                  "& .MuiDayCalendar-weekDayLabel": {
                    color: "rgb(75, 85, 99)",
                    fontWeight: 600,
                    ".dark &": {
                      color: "rgb(209, 213, 219)",
                    },
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

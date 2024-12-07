import * as React from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

interface MuiDateRangePickerProps {
  onDateChange: (range: { from: Date; to: Date }) => void;
  className?: string;
}

export function MuiDateRangePicker({
  onDateChange,
  className,
}: MuiDateRangePickerProps) {
  const [startDate, setStartDate] = React.useState(
    dayjs(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  );
  const [endDate, setEndDate] = React.useState(dayjs(new Date()));

  React.useEffect(() => {
    if (startDate && endDate) {
      onDateChange({
        from: startDate.toDate(),
        to: endDate.toDate(),
      });
    }
  }, [startDate, endDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer
        components={["DatePicker"]}
        sx={{ width: "100%", display: "flex", gap: 2 }}
      >
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(newValue) => newValue && setStartDate(newValue)}
          slotProps={{
            textField: {
              size: "small",
              InputLabelProps: {
                sx: {
                  color: "rgb(31, 41, 55)",
                  ".dark &": {
                    color: "rgb(209, 213, 219) !important",
                  },
                  "&.Mui-focused": {
                    color: "rgb(37, 99, 235)",
                    ".dark &": {
                      color: "rgb(59, 130, 246) !important",
                    },
                  },
                },
              },
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
                },
              },
            },
            popper: {
              sx: {
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
                "& .MuiPickersDay-root": {
                  color: "rgb(55, 65, 81)",
                  ".dark &": {
                    color: "rgb(209, 213, 219)",
                    backgroundColor: "rgb(31, 41, 55)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "rgb(37, 99, 235)",
                    color: "white",
                    ".dark &": {
                      backgroundColor: "rgb(59, 130, 246)",
                    },
                  },
                },
                "& .MuiDayCalendar-weekDayLabel": {
                  color: "rgb(75, 85, 99)",
                  ".dark &": {
                    color: "rgb(209, 213, 219)",
                  },
                },
                "& .css-1chuxo2-MuiPickersCalendarHeader-label": {
                  color: "rgb(31, 41, 55) !important",
                  ".dark &": {
                    color: "rgb(209, 213, 219) !important",
                  },
                },
                "& .MuiPickersCalendarHeader-label": {
                  color: "rgb(31, 41, 55) !important",
                  ".dark &": {
                    color: "rgb(209, 213, 219) !important",
                  },
                },
                "& .css-1ckov0h-MuiSvgIcon-root, & .MuiPickersArrowSwitcher-leftArrowIcon, & .MuiPickersArrowSwitcher-rightArrowIcon":
                  {
                    color: "rgb(31, 41, 55) !important",
                    ".dark &": {
                      color: "rgb(209, 213, 219) !important",
                    },
                  },
                "& .css-14yom7c-MuiSvgIcon-root-MuiPickersCalendarHeader-switchViewIcon, & .MuiPickersCalendarHeader-switchViewIcon":
                  {
                    color: "rgb(31, 41, 55) !important",
                    ".dark &": {
                      color: "rgb(209, 213, 219) !important",
                    },
                  },
                "& .css-innj4t-MuiPickersYear-yearButton, & .MuiPickersYear-yearButton":
                  {
                    color: "rgb(31, 41, 55) !important",
                    ".dark &": {
                      color: "rgb(209, 213, 219) !important",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "rgb(37, 99, 235) !important",
                      color: "white !important",
                      ".dark &": {
                        backgroundColor: "rgb(59, 130, 246) !important",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "rgb(243, 244, 246)",
                      ".dark &": {
                        backgroundColor: "rgb(55, 65, 81)",
                      },
                    },
                  },
                "& .MuiFormLabel-root, & .MuiInputLabel-root, & .css-hvjq6j-MuiFormLabel-root-MuiInputLabel-root":
                  {
                    color: "rgb(31, 41, 55) !important",
                    "&.Mui-focused": {
                      color: "rgb(37, 99, 235) !important",
                    },
                    ".dark &": {
                      color: "rgb(209, 213, 219) !important",
                      "&.Mui-focused": {
                        color: "rgb(59, 130, 246) !important",
                      },
                    },
                  },
                "& .MuiInputLabel-shrink": {
                  color: "rgb(31, 41, 55) !important",
                  ".dark &": {
                    color: "rgb(209, 213, 219) !important",
                  },
                },
                "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
                  color: "rgb(31, 41, 55) !important",
                  ".dark &": {
                    color: "rgb(209, 213, 219) !important",
                  },
                },
                "& .css-1sumxir-MuiFormLabel-root-MuiInputLabel-root": {
                  color: "rgb(31, 41, 55) !important",
                  ".dark &": {
                    color: "rgb(209, 213, 219) !important",
                  },
                },
                "& .css-hvjq6j-MuiFormLabel-root-MuiInputLabel-root": {
                  color: "rgb(31, 41, 55) !important",
                  ".dark &": {
                    color: "rgb(209, 213, 219) !important",
                  },
                },
                "&& .css-hvjq6j-MuiFormLabel-root-MuiInputLabel-root": {
                  color: "rgb(209, 213, 219) !important",
                },
                "&&& .css-hvjq6j-MuiFormLabel-root-MuiInputLabel-root.Mui-focused":
                  {
                    color: "rgb(59, 130, 246) !important",
                  },
                "& .MuiFormLabel-root.MuiInputLabel-root.css-hvjq6j-MuiFormLabel-root-MuiInputLabel-root":
                  {
                    color: "rgb(209, 213, 219) !important",
                  },
              },
            },
          }}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={(newValue) => newValue && setEndDate(newValue)}
          slotProps={{
            textField: {
              size: "small",
              InputLabelProps: {
                sx: {
                  color: "rgb(31, 41, 55)",
                  ".dark &": {
                    color: "rgb(209, 213, 219) !important",
                  },
                  "&.Mui-focused": {
                    color: "rgb(37, 99, 235)",
                    ".dark &": {
                      color: "rgb(59, 130, 246) !important",
                    },
                  },
                },
              },
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
                },
              },
            },
            popper: {
              sx: {
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
                "& .MuiPickersDay-root": {
                  color: "rgb(55, 65, 81)",
                  ".dark &": {
                    color: "rgb(209, 213, 219)",
                    backgroundColor: "rgb(31, 41, 55)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "rgb(37, 99, 235)",
                    color: "white",
                    ".dark &": {
                      backgroundColor: "rgb(59, 130, 246)",
                    },
                  },
                },
                "& .MuiDayCalendar-weekDayLabel": {
                  color: "rgb(75, 85, 99)",
                  ".dark &": {
                    color: "rgb(209, 213, 219)",
                  },
                },
                "& .css-1chuxo2-MuiPickersCalendarHeader-label": {
                  color: "rgb(31, 41, 55) !important",
                  ".dark &": {
                    color: "rgb(209, 213, 219) !important",
                  },
                },
                "& .MuiPickersCalendarHeader-label": {
                  color: "rgb(31, 41, 55) !important",
                  ".dark &": {
                    color: "rgb(209, 213, 219) !important",
                  },
                },
                "& .css-1ckov0h-MuiSvgIcon-root, & .MuiPickersArrowSwitcher-leftArrowIcon, & .MuiPickersArrowSwitcher-rightArrowIcon":
                  {
                    color: "rgb(31, 41, 55) !important",
                    ".dark &": {
                      color: "rgb(209, 213, 219) !important",
                    },
                  },
                "& .css-14yom7c-MuiSvgIcon-root-MuiPickersCalendarHeader-switchViewIcon, & .MuiPickersCalendarHeader-switchViewIcon":
                  {
                    color: "rgb(31, 41, 55) !important",
                    ".dark &": {
                      color: "rgb(209, 213, 219) !important",
                    },
                  },
                "& .css-innj4t-MuiPickersYear-yearButton, & .MuiPickersYear-yearButton":
                  {
                    color: "rgb(31, 41, 55) !important",
                    ".dark &": {
                      color: "rgb(209, 213, 219) !important",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "rgb(37, 99, 235) !important",
                      color: "white !important",
                      ".dark &": {
                        backgroundColor: "rgb(59, 130, 246) !important",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "rgb(243, 244, 246)",
                      ".dark &": {
                        backgroundColor: "rgb(55, 65, 81)",
                      },
                    },
                  },
                "& .MuiFormLabel-root, & .MuiInputLabel-root, & .css-hvjq6j-MuiFormLabel-root-MuiInputLabel-root":
                  {
                    color: "rgb(31, 41, 55) !important",
                    "&.Mui-focused": {
                      color: "rgb(37, 99, 235) !important",
                    },
                    ".dark &": {
                      color: "rgb(209, 213, 219) !important",
                      "&.Mui-focused": {
                        color: "rgb(59, 130, 246) !important",
                      },
                    },
                  },
                "& .MuiInputLabel-shrink": {
                  color: "rgb(31, 41, 55) !important",
                  ".dark &": {
                    color: "rgb(209, 213, 219) !important",
                  },
                },
                "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
                  color: "rgb(31, 41, 55) !important",
                  ".dark &": {
                    color: "rgb(209, 213, 219) !important",
                  },
                },
                "& .css-1sumxir-MuiFormLabel-root-MuiInputLabel-root": {
                  color: "rgb(31, 41, 55) !important",
                  ".dark &": {
                    color: "rgb(209, 213, 219) !important",
                  },
                },
                "& .css-hvjq6j-MuiFormLabel-root-MuiInputLabel-root": {
                  color: "rgb(31, 41, 55) !important",
                  ".dark &": {
                    color: "rgb(209, 213, 219) !important",
                  },
                },
                "&& .css-hvjq6j-MuiFormLabel-root-MuiInputLabel-root": {
                  color: "rgb(209, 213, 219) !important",
                },
                "&&& .css-hvjq6j-MuiFormLabel-root-MuiInputLabel-root.Mui-focused":
                  {
                    color: "rgb(59, 130, 246) !important",
                  },
                "& .MuiFormLabel-root.MuiInputLabel-root.css-hvjq6j-MuiFormLabel-root-MuiInputLabel-root":
                  {
                    color: "rgb(209, 213, 219) !important",
                  },
              },
            },
          }}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}

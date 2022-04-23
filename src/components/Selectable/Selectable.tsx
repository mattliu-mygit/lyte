import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  BackspaceIcon,
  ChevronDownIcon,
  RefreshIcon,
  XIcon,
} from "@heroicons/react/solid";
import { useClickOutside } from "../../utils";

interface DropdownOptions {
  label: string | number;
  content?: ReactNode | string;
}

type Value = string | number;

export interface Props {
  width: number;
  options: DropdownOptions[];
  defaultValue: Value | Value[];
  multi?: boolean;
  onChange?: (values: DropdownOptions[]) => void;
  allowClear?: boolean;
  allowRefill?: boolean;
}

const Selectable: React.FC<Props> = ({
  width,
  options,
  defaultValue,
  multi = false,
  onChange = undefined,
  allowClear = false,
  allowRefill = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState([]);
  const ref = useRef(null);
  const [clickedOutside, setClickedOutside] = useClickOutside(ref);
  const controlsRef = useRef(null);

  useEffect(() => {
    const res = processDefault(defaultValue);
    setSelected(res);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  useEffect(() => {
    if (clickedOutside) {
      setExpanded(false);
      (setClickedOutside as Dispatch<SetStateAction<boolean>>)(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clickedOutside]);

  const processDefault = (defaultValue) => {
    let res;
    if (typeof defaultValue === "string" || typeof defaultValue === "number") {
      const defaultOption = options.filter(
        ({ label }) => label === defaultValue
      );
      if (defaultOption.length > 0) res = [defaultOption[0]];
      else res = [options[0]];
    } else if (Array.isArray(defaultValue)) {
      if (!multi) return [];
      const defaultOptions = [];
      for (const d of defaultValue) {
        if (typeof d !== "string" && typeof d !== "number") return [];
        const defaultOption = options.filter(({ label }) => label === d);
        if (defaultOption.length > 0) defaultOptions.push(defaultOption[0]);
      }
      res = defaultOptions;
    }
    return res;
  };

  const handleExpand = (e) => {
    e.stopPropagation();
    setExpanded((expanded) => !expanded);
  };

  const handleSelect = async (e, option) => {
    e.stopPropagation();
    if (multi) {
      const found = selected.find((s) => s.label === option.label);
      if (found) {
        const newSelected = selected.filter((s) => s.label !== option.label);
        setSelected(newSelected);
        onChange(newSelected);
        return;
      }
      const newSelected = [...selected, option];
      setSelected(newSelected);
      onChange(newSelected);
    } else {
      setSelected([option]);
      onChange([option]);
    }
  };

  return (
    <div
      className="relative z-50 py-1 pl-1 pr-1 text-sm transition-colors duration-100 ease-in border rounded select-none group border-slate-200 hover:border-slate-300"
      style={{ width }}
      onClick={handleExpand}
      ref={ref}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-wrap gap-1">
          {multi ? (
            selected.length ? (
              selected.map((s) => (
                <span
                  style={{
                    maxWidth:
                      width -
                      (controlsRef.current
                        ? controlsRef.current.clientWidth + 10
                        : 0),
                  }}
                  className="flex items-center h-5 gap-1 px-1 truncate duration-100 ease-in rounded-sm transition-color bg-slate-200 hover:bg-slate-300"
                  key={s.label}
                >
                  <p className="truncate" style={{ maxWidth: width }}>
                    {s.content || s.label}
                  </p>
                  <div
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newSelected = selected.filter(
                        (c) => c.label !== s.label
                      );
                      setSelected(newSelected);
                      onChange(newSelected);
                    }}
                  >
                    <XIcon className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                </span>
              ))
            ) : (
              <span className="text-slate-400">Select...</span>
            )
          ) : (
            selected.length && (selected[0].content || selected[0].label)
          )}
        </div>
        <div
          className="flex items-center flex-none h-full gap-1 pl-2 transition-colors duration-100 ease-in"
          ref={controlsRef}
        >
          {multi && (
            <div className="flex gap-1">
              {allowRefill && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(defaultValue);
                    setSelected(options);
                    onChange(options);
                  }}
                >
                  <RefreshIcon className="w-4 h-4 cursor-pointer text-slate-500 hover:text-slate-600" />
                </div>
              )}
              {allowClear && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected([]);
                    onChange([]);
                  }}
                >
                  <BackspaceIcon className="w-4 h-4 cursor-pointer text-slate-500 hover:text-slate-600" />
                </div>
              )}
            </div>
          )}
          <ChevronDownIcon className="w-5 h-5 text-slate-500 group-hover:text-slate-600" />
        </div>
      </div>
      {expanded && (
        <div
          className="fixed bg-white border -translate-x-[4.5px] translate-y-2 border-slate-200 rounded flex flex-col divide-y"
          style={{ width }}
        >
          {options.map((option) => {
            const isSelected = selected.find((s) => s.label === option.label);
            return (
              <div
                key={option.label}
                onClick={(e) => handleSelect(e, option)}
                className={`px-1 py-1 cursor-pointer w-full ${
                  isSelected && "bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  {option.content || option.label}
                  {isSelected && (
                    <p className="text-xs font text-slate-400">Selected</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Selectable;

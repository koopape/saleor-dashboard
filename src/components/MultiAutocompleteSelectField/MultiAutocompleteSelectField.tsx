import { IconButton, TextField, Typography } from "@material-ui/core";
import { fade } from "@material-ui/core/styles/colorManipulator";
import CloseIcon from "@material-ui/icons/Close";
import Debounce, { DebounceProps } from "@saleor/components/Debounce";
import ArrowDropdownIcon from "@saleor/icons/ArrowDropdown";
import { makeStyles } from "@saleor/macaw-ui";
import { FetchMoreProps } from "@saleor/types";
import Downshift, { ControllerStateAndHelpers } from "downshift";
import { filter } from "fuzzaldrin";
import React from "react";

import MultiAutocompleteSelectFieldContent, {
  MultiAutocompleteActionType,
  MultiAutocompleteChoiceType
} from "./MultiAutocompleteSelectFieldContent";

const useStyles = makeStyles(
  theme => ({
    chip: {
      width: "100%"
    },
    chipClose: {
      height: 32,
      padding: 0,
      width: 32
    },
    chipContainer: {
      display: "flex",
      flexDirection: "column",
      marginTop: theme.spacing(1)
    },
    chipInner: {
      "& svg": {
        color: theme.palette.primary.contrastText
      },
      alignItems: "center",
      background: fade(theme.palette.primary.main, 0.8),
      borderRadius: 18,
      color: theme.palette.primary.contrastText,
      display: "flex",
      justifyContent: "space-between",
      margin: theme.spacing(1, 0),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1)
    },
    chipLabel: {
      color: theme.palette.primary.contrastText
    },
    container: {
      flexGrow: 1,
      position: "relative"
    },
    disabledChipInner: {
      "& svg": {
        color: theme.palette.grey[200]
      },
      alignItems: "center",
      background: fade(theme.palette.grey[400], 0.8),
      borderRadius: 18,
      color: theme.palette.primary.contrastText,
      display: "flex",
      justifyContent: "space-between",
      margin: theme.spacing(1, 0),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1)
    }
  }),
  { name: "MultiAutocompleteSelectField" }
);

export interface MultiAutocompleteSelectFieldProps
  extends Partial<FetchMoreProps> {
  add?: MultiAutocompleteActionType;
  allowCustomValues?: boolean;
  displayValues: MultiAutocompleteChoiceType[];
  error?: boolean;
  name: string;
  choices: MultiAutocompleteChoiceType[];
  value: string[];
  loading?: boolean;
  placeholder?: string;
  helperText?: string;
  label?: string;
  disabled?: boolean;
  testId?: string;
  fetchChoices?: (value: string) => void;
  onChange: (event: React.ChangeEvent<any>) => void;
  fetchOnFocus?: boolean;
}

const DebounceAutocomplete: React.ComponentType<DebounceProps<
  string
>> = Debounce;

const MultiAutocompleteSelectFieldComponent: React.FC<MultiAutocompleteSelectFieldProps> = props => {
  const {
    add,
    allowCustomValues,
    choices,
    displayValues,
    error,
    hasMore,
    helperText,
    label,
    loading,
    name,
    placeholder,
    value,
    disabled,
    testId,
    fetchChoices,
    onChange,
    onFetchMore,
    fetchOnFocus,
    ...rest
  } = props;
  const classes = useStyles(props);

  const handleSelect = (
    item: string,
    downshiftOpts?: ControllerStateAndHelpers
  ) => {
    if (downshiftOpts) {
      downshiftOpts.reset({ inputValue: "" });
    }
    onChange({
      target: { name, value: item }
    } as any);
  };

  return (
    <>
      <DebounceAutocomplete debounceFn={fetchChoices}>
        {debounceFn => (
          <Downshift
            onInputValueChange={value => debounceFn(value)}
            onSelect={handleSelect}
            itemToString={() => ""}
          >
            {({
              closeMenu,
              getInputProps,
              getItemProps,
              isOpen,
              toggleMenu,
              highlightedIndex,
              inputValue
            }) => {
              const displayCustomValue =
                inputValue &&
                inputValue.length > 0 &&
                allowCustomValues &&
                !choices.find(
                  choice =>
                    choice.label.toLowerCase() === inputValue.toLowerCase()
                );

              return (
                <div className={classes.container} {...rest}>
                  <TextField
                    InputProps={{
                      ...getInputProps({
                        placeholder
                      }),
                      endAdornment: (
                        <div>
                          <ArrowDropdownIcon onClick={() => toggleMenu()} />
                        </div>
                      ),
                      id: undefined,
                      onClick: toggleMenu,
                      onFocus: () => {
                        if (fetchOnFocus) {
                          fetchChoices(inputValue);
                        }
                      }
                    }}
                    error={error}
                    helperText={helperText}
                    label={label}
                    fullWidth={true}
                    disabled={disabled}
                  />
                  {isOpen && (
                    <MultiAutocompleteSelectFieldContent
                      add={
                        add && {
                          ...add,
                          onClick: () => {
                            add.onClick();
                            closeMenu();
                          }
                        }
                      }
                      choices={choices.filter(
                        choice => !value.includes(choice.value)
                      )}
                      displayCustomValue={displayCustomValue}
                      displayValues={displayValues}
                      getItemProps={getItemProps}
                      hasMore={hasMore}
                      highlightedIndex={highlightedIndex}
                      loading={loading}
                      inputValue={inputValue}
                      onFetchMore={onFetchMore}
                    />
                  )}
                </div>
              );
            }}
          </Downshift>
        )}
      </DebounceAutocomplete>
      <div className={classes.chipContainer}>
        {displayValues.map(value => (
          <div className={classes.chip} key={value.value}>
            <div
              className={
                !value.disabled ? classes.chipInner : classes.disabledChipInner
              }
            >
              <Typography className={classes.chipLabel}>
                {value.label}
              </Typography>

              <IconButton
                data-test-id={testId ? `${testId}Remove` : "remove"}
                className={classes.chipClose}
                disabled={value.disabled}
                onClick={() => handleSelect(value.value)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const MultiAutocompleteSelectField: React.FC<MultiAutocompleteSelectFieldProps> = ({
  choices,
  fetchChoices,
  testId,
  ...props
}) => {
  const [query, setQuery] = React.useState("");

  if (fetchChoices) {
    return (
      <MultiAutocompleteSelectFieldComponent
        testId={testId}
        choices={choices}
        {...props}
        fetchChoices={fetchChoices}
      />
    );
  }

  return (
    <MultiAutocompleteSelectFieldComponent
      fetchChoices={q => setQuery(q || "")}
      choices={filter(choices, query, {
        key: "label"
      })}
      {...props}
    />
  );
};

MultiAutocompleteSelectField.displayName = "MultiAutocompleteSelectField";
export default MultiAutocompleteSelectField;

import { SelectOption } from "@/types/SelectOption";
import { Combobox, Loader, Pill, PillsInput, useCombobox } from "@mantine/core";
import { CSSProperties, useEffect, useState } from "react";

interface Metadata {
  page: number;
  totalPages: number;
}

interface Props {
  label?: string;
  placeholder?: string;
  value: SelectOption[];
  onChange: (value: SelectOption[]) => void;
  fetchUrl: string;
  searchKeys?: string[];
  limit?: number;
  style?: CSSProperties;
  className?: string;
}

export default function RemoteMultiSelect({
  label,
  placeholder,
  value,
  onChange,
  fetchUrl,
  searchKeys = ["name"],
  limit = 20,
  style,
  className,
}: Props) {
  const combobox = useCombobox();

  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);

  const [metadata, setMetadata] = useState<Metadata>({
    page: 1,
    totalPages: 1,
  });

  const fetchData = async (page: number, keyword: string, append = false) => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (keyword.trim()) {
        searchKeys.forEach((key) => {
          params.append(key, keyword);
        });
      }

      const res = await fetch(`${fetchUrl}?${params.toString()}`);

      const json = await res.json();

      if (!json.success) return;

      const data: SelectOption[] = json.data.map((item: any) => ({
        value: item.id.toString(),
        label: item.name,
      }));

      setOptions((prev) => {
        if (!append) return data;

        const map = new Map<string, SelectOption>();

        [...prev, ...data].forEach((item) => {
          map.set(item.value, item);
        });

        return [...map.values()];
      });

      setMetadata(json.metadata);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1, search, false);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const loadMore = () => {
    if (loading) return;

    if (metadata.page >= metadata.totalPages) return;

    fetchData(metadata.page + 1, search, true);
  };

  const filteredOptions = options.filter((item) => !value.some((x) => x.value === item.value));

  return (
    <div style={style} className={className}>
      <Combobox
        store={combobox}
        onOptionSubmit={(val) => {
          const option = options.find((x) => x.value === val);

          if (!option) return;

          if (!value.some((item) => item.value === option.value)) {
            onChange([...value, option]);
          }

          setSearch("");
          combobox.closeDropdown();
        }}
      >
        <Combobox.Target>
          <PillsInput
            label={label}
            onClick={() => {
              combobox.openDropdown();

              if (options.length === 0) {
                fetchData(1, "");
              }
            }}
          >
            {value.map((item) => (
              <Pill key={item.value} withRemoveButton onRemove={() => onChange(value.filter((x) => x.value !== item.value))}>
                {item.label}
              </Pill>
            ))}

            <PillsInput.Field
              value={search}
              placeholder={value.length === 0 ? placeholder : undefined}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
          </PillsInput>
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options
            mah={250}
            style={{ overflowY: "auto" }}
            onScroll={(e) => {
              const target = e.currentTarget;

              if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
                loadMore();
              }
            }}
          >
            {!loading && filteredOptions.length === 0 && <Combobox.Empty>No data found</Combobox.Empty>}

            {filteredOptions.map((item) => (
              <Combobox.Option key={item.value} value={item.value}>
                {item.label}
              </Combobox.Option>
            ))}

            {loading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: 10,
                }}
              >
                <Loader size="sm" />
              </div>
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </div>
  );
}

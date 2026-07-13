'use client';
import { useEffect, useRef, useState } from 'react';
import API from '../../../utils/api';

type Style = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
};

type Props = {
  categoryName: string;
  value: string;
  onChange: (name: string) => void;
  disabled?: boolean;
};

export default function StyleSelect({
  categoryName,
  value,
  onChange,
  disabled,
}: Props) {
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(false);
  const onChangeRef = useRef(onChange);
  const prevCategoryRef = useRef(categoryName);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (prevCategoryRef.current !== categoryName) {
      prevCategoryRef.current = categoryName;
      if (value) onChangeRef.current('');
    }
  }, [categoryName, value]);

  useEffect(() => {
    if (!categoryName.trim()) {
      setStyles([]);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await API.get('/styles', {
          params: { category: categoryName.trim() },
        });
        if (!cancelled) {
          setStyles(res.data.data || []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setStyles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [categoryName]);

  useEffect(() => {
    if (!value || styles.length === 0) return;
    const stillValid = styles.some(
      (s) => s.name.toLowerCase() === value.toLowerCase()
    );
    if (!stillValid) onChangeRef.current('');
  }, [styles, value]);

  if (!categoryName.trim()) {
    return (
      <select
        disabled
        className="w-full p-2 border rounded border-gray-300 bg-gray-50 text-gray-500"
      >
        <option>Select a category first</option>
      </select>
    );
  }

  return (
    <select
      value={value}
      disabled={disabled || loading}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded border-gray-300 bg-white"
    >
      <option value="">
        {loading ? 'Loading styles…' : styles.length ? 'Select style' : 'No styles for this category'}
      </option>
      {styles.map((style) => (
        <option key={style.id} value={style.name}>
          {style.name}
        </option>
      ))}
    </select>
  );
}

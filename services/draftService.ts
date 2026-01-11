
import { Draft } from '../types';

const STORAGE_KEY = 'gege_drafts';

export const getDrafts = (): Draft[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveDraft = (title: string, module: string, content: string): Draft[] => {
  const drafts = getDrafts();
  const newDraft: Draft = {
    id: Math.random().toString(36).substr(2, 9),
    title,
    module,
    content,
    timestamp: Date.now()
  };
  const updated = [newDraft, ...drafts];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteDraft = (id: string): Draft[] => {
  const drafts = getDrafts();
  const updated = drafts.filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const clearAllDrafts = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const downloadDraftAsText = (draft: Draft) => {
  const element = document.createElement("a");
  const file = new Blob([`GEGE VISION DRAFT\nTitle: ${draft.title}\nModule: ${draft.module}\nDate: ${new Date(draft.timestamp).toLocaleString()}\n\nContent:\n${draft.content}`], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = `gege-draft-${draft.id}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

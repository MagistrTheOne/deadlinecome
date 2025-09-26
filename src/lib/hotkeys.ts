"use client";

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface HotkeyConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  category: 'navigation' | 'actions' | 'drag-drop' | 'development';
}

export class HotkeyManager {
  private static instance: HotkeyManager;
  private hotkeys: Map<string, HotkeyConfig> = new Map();
  private router: any = null;

  static getInstance(): HotkeyManager {
    if (!HotkeyManager.instance) {
      HotkeyManager.instance = new HotkeyManager();
    }
    return HotkeyManager.instance;
  }

  setRouter(router: any) {
    this.router = router;
  }

  registerHotkey(config: HotkeyConfig) {
    const key = this.getKeyString(config);
    this.hotkeys.set(key, config);
  }

  private getKeyString(config: HotkeyConfig): string {
    const modifiers = [];
    if (config.ctrl) modifiers.push('ctrl');
    if (config.shift) modifiers.push('shift');
    if (config.alt) modifiers.push('alt');
    if (config.meta) modifiers.push('meta');
    
    return `${modifiers.join('+')}+${config.key.toLowerCase()}`;
  }

  handleKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey;
    const shift = event.shiftKey;
    const alt = event.altKey;
    const meta = event.metaKey;

    // Игнорируем если фокус на input/textarea
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true')) {
      return;
    }

    const keyString = this.getKeyString({ key, ctrl, shift, alt, meta });
    const hotkey = this.hotkeys.get(keyString);

    if (hotkey) {
      event.preventDefault();
      hotkey.action();
    }
  }

  getAllHotkeys(): HotkeyConfig[] {
    return Array.from(this.hotkeys.values());
  }

  getHotkeysByCategory(category: string): HotkeyConfig[] {
    return Array.from(this.hotkeys.values()).filter(h => h.category === category);
  }
}

export function useHotkeys() {
  const router = useRouter();
  const hotkeyManager = HotkeyManager.getInstance();

  useEffect(() => {
    hotkeyManager.setRouter(router);
  }, [router]);

  const registerHotkey = useCallback((config: HotkeyConfig) => {
    hotkeyManager.registerHotkey(config);
  }, []);

  const registerDefaultHotkeys = useCallback(() => {
    // Навигация
    hotkeyManager.registerHotkey({
      key: 'k',
      ctrl: true,
      action: () => {
        // Глобальный поиск
        const searchInput = document.querySelector('[data-global-search]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Глобальный поиск',
      category: 'navigation'
    });

    hotkeyManager.registerHotkey({
      key: '1',
      ctrl: true,
      action: () => router.push('/dashboard'),
      description: 'Dashboard',
      category: 'navigation'
    });

    hotkeyManager.registerHotkey({
      key: '2',
      ctrl: true,
      action: () => router.push('/projects'),
      description: 'Проекты',
      category: 'navigation'
    });

    hotkeyManager.registerHotkey({
      key: '3',
      ctrl: true,
      action: () => router.push('/tasks'),
      description: 'Задачи',
      category: 'navigation'
    });

    hotkeyManager.registerHotkey({
      key: '4',
      ctrl: true,
      action: () => router.push('/calendar'),
      description: 'Календарь',
      category: 'navigation'
    });

    hotkeyManager.registerHotkey({
      key: '5',
      ctrl: true,
      action: () => router.push('/team'),
      description: 'Команда',
      category: 'navigation'
    });

    hotkeyManager.registerHotkey({
      key: '6',
      ctrl: true,
      action: () => router.push('/analytics'),
      description: 'Аналитика',
      category: 'navigation'
    });

    hotkeyManager.registerHotkey({
      key: ',',
      ctrl: true,
      action: () => router.push('/settings'),
      description: 'Настройки',
      category: 'navigation'
    });

    // Действия
    hotkeyManager.registerHotkey({
      key: 'n',
      ctrl: true,
      action: () => router.push('/tasks?action=create'),
      description: 'Создать новую задачу',
      category: 'actions'
    });

    hotkeyManager.registerHotkey({
      key: 'n',
      ctrl: true,
      shift: true,
      action: () => router.push('/projects?action=create'),
      description: 'Создать новый проект',
      category: 'actions'
    });

    hotkeyManager.registerHotkey({
      key: 'w',
      ctrl: true,
      shift: true,
      action: () => router.push('/workspaces?action=create'),
      description: 'Создать рабочее пространство',
      category: 'actions'
    });

    hotkeyManager.registerHotkey({
      key: 'Enter',
      ctrl: true,
      action: () => {
        // Сохранить изменения
        const saveButton = document.querySelector('[data-save-button]') as HTMLButtonElement;
        if (saveButton) {
          saveButton.click();
        }
      },
      description: 'Сохранить изменения',
      category: 'actions'
    });

    hotkeyManager.registerHotkey({
      key: 'Escape',
      action: () => {
        // Отменить/Закрыть
        const cancelButton = document.querySelector('[data-cancel-button]') as HTMLButtonElement;
        if (cancelButton) {
          cancelButton.click();
        }
      },
      description: 'Отменить/Закрыть',
      category: 'actions'
    });

    // Drag & Drop
    hotkeyManager.registerHotkey({
      key: ' ',
      action: () => {
        // Выбрать задачу для перетаскивания
        const draggableTask = document.querySelector('[data-draggable-task]') as HTMLElement;
        if (draggableTask) {
          draggableTask.focus();
        }
      },
      description: 'Выбрать задачу для перетаскивания',
      category: 'drag-drop'
    });

    // Разработка
    hotkeyManager.registerHotkey({
      key: 'd',
      ctrl: true,
      action: () => router.push('/ai/vasily'),
      description: 'Открыть Василия AI',
      category: 'development'
    });

    hotkeyManager.registerHotkey({
      key: 'g',
      ctrl: true,
      action: () => router.push('/ai/generator'),
      description: 'AI Генератор кода',
      category: 'development'
    });

    hotkeyManager.registerHotkey({
      key: 'p',
      ctrl: true,
      action: () => router.push('/ai/design'),
      description: 'AI Дизайн-система',
      category: 'development'
    });
  }, [router]);

  useEffect(() => {
    registerDefaultHotkeys();

    const handleKeyDown = (event: KeyboardEvent) => {
      hotkeyManager.handleKeyDown(event);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [registerDefaultHotkeys]);

  return {
    registerHotkey,
    getAllHotkeys: () => hotkeyManager.getAllHotkeys(),
    getHotkeysByCategory: (category: string) => hotkeyManager.getHotkeysByCategory(category)
  };
}

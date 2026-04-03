#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Универсальный скрипт для создания бэкапов проектов
Автор: AI Assistant
Версия: 2.0
"""

import os
import sys
import json
import zipfile
import shutil
import argparse
import fnmatch
from datetime import datetime
from pathlib import Path
import tkinter as tk
from tkinter import filedialog, messagebox

class BackupManager:
    def __init__(self, project_dir=None):
        """Инициализация менеджера бэкапов"""
        self.project_dir = Path(project_dir).resolve() if project_dir else Path.cwd()
        self.config_file = self.project_dir / '.backup_config.json'
        self.config = self.load_config()
        
    def load_config(self):
        """Загрузка конфигурации"""
        default_exclude_patterns = [
            "node_modules/**",
            "**/node_modules/**",
            ".next/**",
            "**/.next/**",
            ".turbo/**",
            "**/.turbo/**",
            ".cache/**",
            "**/.cache/**",
            ".swc/**",
            "**/.swc/**",
            "out/**",
            "**/out/**",
            "dist/**",
            "**/dist/**",
            "build/**",
            "**/build/**",
            "coverage/**",
            "**/coverage/**",
            "__pycache__/**",
            "**/__pycache__/**",
            "**/*.pyc",
            "**/*.pyo",
            "**/*.log",
            "**/npm-debug.log*",
            "**/yarn-debug.log*",
            "**/yarn-error.log*",
            ".pnpm-store/**",
            "**/.pnpm-store/**",
            ".idea/**",
            "**/.idea/**",
            ".vscode/**",
            "**/.vscode/**",
            "src/lib/prisma-client/**",
            "**/src/lib/prisma-client/**",
        ]

        default_config = {
            "backup_dir": str(Path.home() / f"{self.project_dir.name}_Backups"),
            "exclude_patterns": default_exclude_patterns,
            "exclude_files": [
                "backup.py", "restore.py", ".backup_config.json"
            ],
            "max_backups": 10,
            "compression_level": 6
        }
        
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                    default_config.update(user_config)
            except Exception as e:
                print(f"⚠️  Ошибка загрузки конфигурации: {e}")
                print("📝 Используется конфигурация по умолчанию")

        if not default_config.get("exclude_patterns"):
            default_config["exclude_patterns"] = default_exclude_patterns
        
        return default_config
    
    def save_config(self):
        """Сохранение конфигурации"""
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"⚠️  Ошибка сохранения конфигурации: {e}")
    
    def select_backup_folder(self):
        """Выбор папки для бэкапов через графическое окно"""
        try:
            # Создаем скрытое главное окно
            root = tk.Tk()
            root.withdraw()  # Скрываем главное окно
            root.attributes('-topmost', True)  # Поверх всех окон
            
            # Показываем диалог выбора папки
            selected_folder = filedialog.askdirectory(
                title="Выберите папку для сохранения бэкапов",
                initialdir=str(Path.home()),
                mustexist=True
            )
            
            root.destroy()  # Закрываем tkinter
            
            if selected_folder:
                # Создаем подпапку с именем проекта
                backup_folder_name = f"{self.project_dir.name}_Backups"
                full_backup_path = Path(selected_folder) / backup_folder_name
                
                # Обновляем конфигурацию
                self.config['backup_dir'] = str(full_backup_path)
                self.save_config()
                
                print(f"✅ Папка для бэкапов установлена: {full_backup_path}")
                return str(full_backup_path)
            else:
                print("❌ Папка не выбрана. Используется папка по умолчанию.")
                return None
                
        except Exception as e:
            print(f"⚠️  Ошибка выбора папки: {e}")
            return None
    
    def setup_first_run(self):
        """Настройка при первом запуске"""
        if not self.config_file.exists():
            print("🎉 Добро пожаловать! Это первый запуск скрипта бэкапа.")
            print("📁 Выберите папку для сохранения бэкапов...")
            print()
            
            # Показываем диалог выбора папки
            selected_path = self.select_backup_folder()
            
            if not selected_path:
                # Если папка не выбрана, используем папку по умолчанию
                default_path = str(Path.home() / f"{self.project_dir.name}_Backups")
                self.config['backup_dir'] = default_path
                print(f"📂 Используется папка по умолчанию: {default_path}")
            
            # Сохраняем конфигурацию
            self.save_config()
            print("✅ Настройка завершена!")
            print()
            
            return True
        return False
    
    def should_exclude(self, file_path):
        """Проверка, нужно ли исключить файл/папку"""
        path = Path(file_path)
        try:
            relative_path = path.relative_to(self.project_dir) if path.is_absolute() else path
        except ValueError:
            relative_path = path
        
        # Исключаем конкретные файлы
        if relative_path.name in self.config['exclude_files']:
            return True
            
        # Исключаем по паттернам
        for pattern in self.config['exclude_patterns']:
            pat = pattern.replace("\\", "/")
            rel_posix = relative_path.as_posix()
            rel_candidates = {rel_posix, f"{rel_posix}/"}
            parent_candidates = {p.as_posix() for p in relative_path.parents}
            parent_candidates |= {f"{p}/" for p in parent_candidates}
            if any(fnmatch.fnmatch(c, pat) for c in rel_candidates) or any(fnmatch.fnmatch(c, pat) for c in parent_candidates):
                return True
                
        return False
    
    def get_files_to_backup(self):
        """Получение списка файлов для бэкапа"""
        files_to_backup = []
        excluded_count = 0
        
        for root, dirs, files in os.walk(self.project_dir):
            # Фильтруем директории
            dirs[:] = [d for d in dirs if not self.should_exclude((Path(root) / d).relative_to(self.project_dir))]
            
            for file in files:
                file_path = Path(root) / file
                relative_path = file_path.relative_to(self.project_dir)
                
                if self.should_exclude(relative_path):
                    excluded_count += 1
                else:
                    files_to_backup.append(file_path)
        
        return files_to_backup, excluded_count
    
    def create_backup(self):
        """Создание бэкапа"""
        # Проверяем первый запуск
        if self.setup_first_run():
            print("🔄 Перезагружаем конфигурацию...")
            self.config = self.load_config()
        
        print("🚀 Создание бэкапа...")
        
        # Создаем директорию для бэкапов
        backup_dir = Path(self.config['backup_dir'])
        backup_dir.mkdir(parents=True, exist_ok=True)
        
        # Генерируем имя файла бэкапа
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        backup_filename = f"{self.project_dir.name}_backup_{timestamp}.zip"
        backup_path = backup_dir / backup_filename
        
        print(f"📦 Архив: {backup_filename}")
        print(f"📁 Путь: {backup_path}")
        print()
        
        # Получаем файлы для бэкапа
        files_to_backup, excluded_count = self.get_files_to_backup()
        
        if not files_to_backup:
            print("⚠️  Нет файлов для бэкапа!")
            return False
        
        # Создаем архив
        success_count = 0
        skipped_count = 0
        
        try:
            with zipfile.ZipFile(backup_path, 'w', zipfile.ZIP_DEFLATED, 
                               compresslevel=self.config['compression_level']) as zipf:
                for file_path in files_to_backup:
                    relative_path = file_path.relative_to(self.project_dir)
                    try:
                        zipf.write(file_path, relative_path)
                        success_count += 1
                    except PermissionError:
                        # Если файл заблокирован, пробуем скопировать его во временный файл
                        try:
                            temp_copy = file_path.with_name(f".tmp_{file_path.name}")
                            shutil.copy2(file_path, temp_copy)
                            zipf.write(temp_copy, relative_path)
                            os.remove(temp_copy)
                            print(f"⚠️  Файл заблокирован (сохранен через копию): {relative_path}")
                            success_count += 1
                        except Exception as e:
                            print(f"❌ Не удалось сохранить заблокированный файл: {relative_path} ({e})")
                            skipped_count += 1
                    except Exception as e:
                        print(f"❌ Ошибка при добавлении файла: {relative_path} ({e})")
                        skipped_count += 1
            
            # Получаем размер архива
            archive_size = backup_path.stat().st_size / (1024 * 1024)  # MB
            
            print("✅ Бэкап завершен!")
            print(f"📊 Добавлено файлов: {success_count}")
            if skipped_count > 0:
                print(f"⚠️  Пропущено ошибок: {skipped_count}")
            print(f"🚫 Исключено конфигурацией: {excluded_count}")
            print(f"💾 Размер архива: {archive_size:.2f} MB")
            print(f"🕒 Время: {datetime.now().strftime('%H:%M:%S')}")
            
            # Очистка старых бэкапов
            self.cleanup_old_backups(backup_dir)
            
            return True
            
        except Exception as e:
            print(f"❌ Критическая ошибка создания бэкапа: {e}")
            return False
    
    def cleanup_old_backups(self, backup_dir):
        """Очистка старых бэкапов"""
        try:
            backup_files = list(backup_dir.glob(f"{self.project_dir.name}_backup_*.zip"))
            backup_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
            
            if len(backup_files) > self.config['max_backups']:
                files_to_delete = backup_files[self.config['max_backups']:]
                for file_path in files_to_delete:
                    file_path.unlink()
                    print(f"🗑️  Удален старый бэкап: {file_path.name}")
                    
        except Exception as e:
            print(f"⚠️  Ошибка очистки старых бэкапов: {e}")

def main():
    """Главная функция"""
    parser = argparse.ArgumentParser(description='Создание бэкапа проекта')
    parser.add_argument('--dir', '-d', help='Директория проекта (по умолчанию: текущая)')
    parser.add_argument('--config', '-c', action='store_true', help='Показать текущую конфигурацию')
    parser.add_argument('--change-folder', '-f', action='store_true', help='Изменить папку для бэкапов')
    
    args = parser.parse_args()
    
    # Создаем менеджер бэкапов
    backup_manager = BackupManager(args.dir)
    
    if args.config:
        print("⚙️  Настройка конфигурации...")
        print("📝 Текущая конфигурация:")
        print(json.dumps(backup_manager.config, indent=2, ensure_ascii=False))
        
        backup_manager.save_config()
        print("✅ Конфигурация сохранена!")
        return
    
    if args.change_folder:
        print("📁 Изменение папки для бэкапов...")
        selected_path = backup_manager.select_backup_folder()
        if selected_path:
            print("✅ Папка для бэкапов успешно изменена!")
        else:
            print("❌ Папка не была изменена.")
        return
    
    # Создаем бэкап
    success = backup_manager.create_backup()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()

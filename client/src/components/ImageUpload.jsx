import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { api } from '../api';
import { useToast } from './ToastContext';

export default function ImageUpload({ onUploadSuccess, currentImageUrl }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentImageUrl || null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const { addToast } = useToast();

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await uploadFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = async (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            await uploadFile(e.target.files[0]);
        }
    };

    const uploadFile = async (file) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            addToast('Sadece resim dosyaları yüklenebilir (JPEG, PNG, GIF, WebP, SVG)', 'error');
            return;
        }

        // Validate file size (20MB)
        if (file.size > 20 * 1024 * 1024) {
            addToast('Dosya boyutu 20MB\'dan küçük olmalıdır', 'error');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/media/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const { url } = response.data;
            setPreview(url);
            onUploadSuccess(url);
            addToast('Görsel başarıyla yüklendi!', 'success');
        } catch (error) {
            console.error('Upload error:', error);
            addToast('Görsel yüklenirken bir hata oluştu', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemove = () => {
        setPreview(null);
        onUploadSuccess(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <label htmlFor="image-upload-input" className="block text-sm font-medium text-[hsl(var(--color-text-primary))]">
                Öne Çıkan Görsel
            </label>

            {preview ? (
                <div className="relative group">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg border-2 border-[hsl(var(--color-border))]"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={handleButtonClick}
                            className="btn btn-primary px-4 py-2"
                        >
                            <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Değiştir
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="btn bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                        >
                            <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Kaldır
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary))]/5'
                            : 'border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary))]/50'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        id="image-upload-input"
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                        onChange={handleChange}
                        disabled={uploading}
                    />

                    {uploading ? (
                        <div className="space-y-3">
                            <div className="w-12 h-12 mx-auto border-4 border-[hsl(var(--color-primary))] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm text-[hsl(var(--color-text-secondary))]">Yükleniyor...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <svg
                                className="w-12 h-12 mx-auto text-[hsl(var(--color-text-tertiary))]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <div>
                                <button
                                    type="button"
                                    onClick={handleButtonClick}
                                    className="btn btn-primary px-4 py-2"
                                >
                                    Görsel Seç
                                </button>
                                <p className="mt-2 text-sm text-[hsl(var(--color-text-secondary))]">
                                    veya sürükleyip bırakın
                                </p>
                            </div>
                            <p className="text-xs text-[hsl(var(--color-text-tertiary))]">
                                JPEG, PNG, GIF, WebP veya SVG (Maks. 20MB)
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

ImageUpload.propTypes = {
    onUploadSuccess: PropTypes.func.isRequired,
    currentImageUrl: PropTypes.string,
};

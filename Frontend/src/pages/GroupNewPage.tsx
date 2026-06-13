import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ImagePlus,
  MapPin,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { koreanRegions, provinceOptions } from '../utils/koreanRegions';
import { createGroup, uploadGroupImage } from '../utils/groupApi';
import { styles } from './GroupNewPage.styles';

const GROUP_NAME_MAX_LENGTH = 40;
const DESCRIPTION_MAX_LENGTH = 60;
const OPERATION_NOTICE_MAX_LENGTH = 150;
const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024;
const IMAGE_OUTPUT_SIZE = 640;

type FeedbackField = 'image' | 'name' | 'province' | 'district' | 'description';

type FieldFeedback = {
  field: FeedbackField;
  message: string;
} | null;

function createSquareImagePreview(file: File) {
  return new Promise<{ previewUrl: string; imageFile: File }>((resolve, reject) => {
    const image = new Image();
    const sourceUrl = URL.createObjectURL(file);

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
      const sourceX = (image.naturalWidth - sourceSize) / 2;
      const sourceY = (image.naturalHeight - sourceSize) / 2;

      canvas.width = IMAGE_OUTPUT_SIZE;
      canvas.height = IMAGE_OUTPUT_SIZE;

      context?.drawImage(
        image,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        IMAGE_OUTPUT_SIZE,
        IMAGE_OUTPUT_SIZE,
      );

      URL.revokeObjectURL(sourceUrl);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('이미지를 처리할 수 없습니다.'));
          return;
        }

        resolve({
          previewUrl: URL.createObjectURL(blob),
          imageFile: new File([blob], 'group-profile.webp', {
            type: 'image/webp',
          }),
        });
      }, 'image/webp', 0.86);
    };

    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error('이미지를 불러올 수 없습니다.'));
    };

    image.src = sourceUrl;
  });
}

export default function GroupNewPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldFeedback, setFieldFeedback] = useState<FieldFeedback>(null);
  const [formData, setFormData] = useState({
    name: '',
    province: '',
    district: '',
    description: '',
    operationNotice: '',
  });

  const districtOptions = formData.province
    ? koreanRegions[formData.province]
    : [];

  useEffect(() => () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
  }, [imagePreviewUrl]);

  const clearFieldFeedback = (field: FeedbackField) => {
    setFieldFeedback((current) => current?.field === field ? null : current);
  };

  const renderFieldFeedback = (field: FeedbackField) => {
    if (fieldFeedback?.field !== field) {
      return null;
    }

    return (
      <span className = {styles.fieldMessage}>
        {fieldFeedback.message}
      </span>
    );
  };

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFieldFeedback({
        field: 'image',
        message: '이미지 파일만 업로드할 수 있습니다.',
      });
      return;
    }

    if (file.size > MAX_IMAGE_FILE_SIZE) {
      setFieldFeedback({
        field: 'image',
        message: '10MB 이하의 이미지를 선택해주세요.',
      });
      return;
    }

    try {
      const processedImage = await createSquareImagePreview(file);

      setImagePreviewUrl(processedImage.previewUrl);
      setImageFile(processedImage.imageFile);
      clearFieldFeedback('image');
    } catch {
      setFieldFeedback({
        field: 'image',
        message: '이미지를 처리할 수 없습니다.',
      });
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await processImageFile(file);

    event.target.value = '';
  };

  const handleImageDrag = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === 'dragenter' || event.type === 'dragover') {
      setIsImageDragging(true);
      return;
    }

    setIsImageDragging(false);
  };

  const handleImageDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsImageDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      await processImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreviewUrl(null);
    setImageFile(null);
    clearFieldFeedback('image');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setFieldFeedback({
        field: 'name',
        message: '모임명을 입력해주세요.',
      });
      return;
    }

    if (!formData.province) {
      setFieldFeedback({
        field: 'province',
        message: '시·도를 선택해주세요.',
      });
      return;
    }

    if (districtOptions.length > 0 && !formData.district) {
      setFieldFeedback({
        field: 'district',
        message: '시·군·구를 선택해주세요.',
      });
      return;
    }

    if (!formData.description.trim()) {
      setFieldFeedback({
        field: 'description',
        message: '모임 설명을 입력해주세요.',
      });
      return;
    }

    setFieldFeedback(null);
    setIsSubmitting(true);

    try {
      const uploadedImage = imageFile
        ? await uploadGroupImage(imageFile)
        : null;

      await createGroup({
        name: formData.name.trim(),
        profileImageUrl: uploadedImage?.imageUrl ?? null,
        activityRegion: formData.district
          ? `${formData.province} ${formData.district}`
          : formData.province,
        description: formData.description.trim(),
        operationNotice: formData.operationNotice.trim() || null,
      });
      navigate('/groups');
    } catch {
      setFieldFeedback({
        field: imageFile ? 'image' : 'name',
        message: '모임을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className = {styles.page}>
      <div className = {styles.backgroundGlowTop} />
      <div className = {styles.backgroundGlowBottom} />

      <div className = {styles.pageShell}>
        <header className = {styles.header}>
          <Link to = "/groups" className = {styles.backLink}>
            <ArrowLeft className = {styles.backIcon} />
            내 모임으로 돌아가기
          </Link>

          <h1 className = {styles.title}>
            모임 만들기
          </h1>

          <p className = {styles.subtitle}>
            모임의 기본 정보를 등록하면 바로 운영을 시작할 수 있습니다.
          </p>
        </header>

        <form onSubmit = {handleSubmit} className = {styles.form} noValidate>
          <section className = {styles.fieldSection}>
            <div className = {styles.labelRow}>
              <div>
                <Label className = {styles.label}>
                  모임 대표 이미지
                  <span>선택</span>
                </Label>
                <p className = {styles.fieldGuide}>
                  목록에서 잘 보이도록 중앙 기준 정사각형 이미지로 자동 조정됩니다.
                </p>
              </div>

              {renderFieldFeedback('image')}
            </div>

            <input
              ref = {fileInputRef}
              type = "file"
              accept = "image/png,image/jpeg,image/webp"
              className = {styles.hiddenInput}
              onChange = {handleImageChange}
            />

            <div
              className = {`${styles.imageUploadBox} ${isImageDragging ? styles.imageUploadBoxDragging : ''}`}
              onDragEnter = {handleImageDrag}
              onDragOver = {handleImageDrag}
              onDragLeave = {handleImageDrag}
              onDrop = {handleImageDrop}
            >
              {imagePreviewUrl ? (
                <img
                  src = {imagePreviewUrl}
                  alt = "모임 대표 이미지 미리보기"
                  className = {styles.imagePreview}
                />
              ) : (
                <div className = {styles.imagePlaceholder}>
                  <ImagePlus className = {styles.imagePlaceholderIcon} />
                  <strong>대표 이미지를 추가해주세요</strong>
                  <span>JPG, PNG, WEBP · 최대 10MB</span>
                </div>
              )}

              <div className = {styles.imageActions}>
                <Button
                  type = "button"
                  variant = "outline"
                  className = {styles.imageButton}
                  onClick = {() => fileInputRef.current?.click()}
                >
                  <ImagePlus className = {styles.buttonIcon} />
                  {imagePreviewUrl ? '이미지 변경' : '이미지 선택'}
                </Button>

                {imagePreviewUrl && (
                  <Button
                    type = "button"
                    variant = "outline"
                    className = {styles.removeImageButton}
                    onClick = {handleRemoveImage}
                  >
                    <Trash2 className = {styles.buttonIcon} />
                    삭제
                  </Button>
                )}
              </div>
            </div>
          </section>

          <section className = {styles.fieldSection}>
            <div className = {styles.labelRow}>
              <Label htmlFor = "name" className = {styles.label}>
                모임명
                <em>필수</em>
              </Label>
              {renderFieldFeedback('name')}
            </div>

            <Input
              id = "name"
              value = {formData.name}
              maxLength = {GROUP_NAME_MAX_LENGTH}
              onChange = {(event) => {
                setFormData({
                  ...formData,
                  name: event.target.value,
                });
                clearFieldFeedback('name');
              }}
              placeholder = "예: 강남 배드민턴 클럽"
              className = {styles.input}
            />

            <div className = {styles.fieldFooter}>
              <span>지역이나 모임 성격을 알아보기 쉽게 표현해주세요.</span>
              <em>{formData.name.length}/{GROUP_NAME_MAX_LENGTH}</em>
            </div>
          </section>

          <section className = {styles.fieldSection}>
            <div className = {styles.labelRow}>
              <div>
                <Label className = {styles.label}>
                  활동 지역
                  <em>필수</em>
                </Label>
              </div>
              {renderFieldFeedback('province') || renderFieldFeedback('district')}
            </div>

            <div className = {styles.regionStack}>
              <div className = {styles.selectWrapper}>
                <MapPin className = {styles.selectIcon} />
                <Select
                  value = {formData.province}
                  onValueChange = {(province) => {
                    setFormData({
                      ...formData,
                      province,
                      district: '',
                    });
                    clearFieldFeedback('province');
                    clearFieldFeedback('district');
                  }}
                >
                  <SelectTrigger className = {styles.selectTrigger}>
                    <SelectValue placeholder = "시·도 선택" />
                  </SelectTrigger>
                  <SelectContent className = {styles.selectContent}>
                    {provinceOptions.map((province) => (
                      <SelectItem
                        key = {province}
                        value = {province}
                        className = {styles.selectItem}
                      >
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className = {styles.selectWrapper}>
                <MapPin className = {styles.selectIcon} />
                <Select
                  value = {formData.district}
                  disabled = {!formData.province || districtOptions.length === 0}
                  onValueChange = {(district) => {
                    setFormData({
                      ...formData,
                      district,
                    });
                    clearFieldFeedback('district');
                  }}
                >
                  <SelectTrigger className = {styles.selectTrigger}>
                    <SelectValue
                      placeholder = {districtOptions.length === 0 && formData.province
                        ? '시·군·구 전체'
                        : '시·군·구 선택'}
                    />
                  </SelectTrigger>
                  <SelectContent className = {styles.selectContent}>
                    <SelectItem value = "전체" className = {styles.selectItem}>
                      전체
                    </SelectItem>
                    {districtOptions.map((district) => (
                      <SelectItem
                        key = {district}
                        value = {district}
                        className = {styles.selectItem}
                      >
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className = {styles.fieldGuide}>
              지역 전체에서 활동한다면 시·군·구에서 전체를 선택해주세요.
            </p>
          </section>

          <section className = {styles.fieldSection}>
            <div className = {styles.labelRow}>
              <Label htmlFor = "description" className = {styles.label}>
                모임 설명
                <em>필수</em>
              </Label>
              {renderFieldFeedback('description')}
            </div>

            <Textarea
              id = "description"
              value = {formData.description}
              maxLength = {DESCRIPTION_MAX_LENGTH}
              rows = {4}
              onChange = {(event) => {
                setFormData({
                  ...formData,
                  description: event.target.value,
                });
                clearFieldFeedback('description');
              }}
              placeholder = "모임의 분위기, 참여 대상, 운동 방식을 간단히 소개해주세요."
              className = {styles.textarea}
            />

            <div className = {styles.fieldFooter}>
              <span>내 모임 목록에서 한눈에 읽을 수 있도록 간단하게 작성해주세요.</span>
              <em>{formData.description.length}/{DESCRIPTION_MAX_LENGTH}</em>
            </div>
          </section>

          <section className = {styles.fieldSection}>
            <div className = {styles.labelRow}>
              <Label htmlFor = "operationNotice" className = {styles.label}>
                운영 안내
                <span>선택</span>
              </Label>
            </div>

            <Textarea
              id = "operationNotice"
              value = {formData.operationNotice}
              maxLength = {OPERATION_NOTICE_MAX_LENGTH}
              rows = {4}
              onChange = {(event) => setFormData({
                ...formData,
                operationNotice: event.target.value,
              })}
              placeholder = "참석 등록 마감, 준비물, 운영 규칙 등을 안내해주세요."
              className = {styles.textarea}
            />

            <div className = {styles.fieldFooter}>
              <span>모임 정보에서 멤버들이 확인할 수 있습니다.</span>
              <em>{formData.operationNotice.length}/{OPERATION_NOTICE_MAX_LENGTH}</em>
            </div>
          </section>

          <div className = {styles.actions}>
            <Button
              asChild
              type = "button"
              variant = "outline"
              className = {styles.cancelButton}
            >
              <Link to = "/groups">
                취소
              </Link>
            </Button>

            <Button
              type = "submit"
              className = {styles.submitButton}
              disabled = {isSubmitting}
            >
              <PlusCircle className = {styles.buttonIcon} />
              모임 만들기
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

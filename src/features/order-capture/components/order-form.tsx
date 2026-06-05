"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ImageUp, Loader2, Send, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useForm, useWatch } from "react-hook-form";
import { PRODUCT_OPTIONS } from "@/features/order-capture/data/product-options";
import {
  formatCep,
  formatPhone,
  MAX_IMAGE_SIZE_BYTES,
  orderFormSchema,
  type OrderFormValues,
} from "@/features/order-capture/domain/order.schema";
import { formatBytes } from "@/features/order-capture/services/image-to-base64";

type OrderFormProps = {
  isSubmitting: boolean;
  onSubmit: (values: OrderFormValues, onSuccess: () => void) => Promise<void>;
};

export function OrderForm({ isSubmitting, onSubmit }: OrderFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    control,
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      telefone: "",
      produto: undefined,
      cep: "",
      imagem: undefined,
    },
  });

  const selectedImage = useWatch({ control, name: "imagem" });

  const imagePreview = useMemo(() => {
    if (!selectedImage || typeof URL === "undefined" || !URL.createObjectURL) {
      return null;
    }

    return URL.createObjectURL(selectedImage);
  }, [selectedImage]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const imageSummary = useMemo(() => {
    if (!selectedImage) {
      return null;
    }

    return `${selectedImage.name} · ${formatBytes(selectedImage.size)}`;
  }, [selectedImage]);

  const disabled = isSubmitting;

  const fieldInputCls =
    "w-full min-h-11.5 border border-border-strong rounded-md bg-control text-foreground px-3.25 outline-none placeholder:text-subtle focus:border-brand focus:shadow-(--focus) aria-invalid:border-danger";

  return (
    <section
      className="border border-border rounded-lg bg-panel shadow-(--shadow-soft) p-4.5 lg:p-6"
      aria-labelledby="order-title"
    >
      <div className="grid gap-1.5 mb-4.5">
        <h1 id="order-title" className="m-0 text-[1.35rem] leading-[1.18] lg:text-[1.55rem]">
          Novo pedido
        </h1>
        <p className="max-w-[58ch] m-0 text-muted text-[0.92rem] leading-[1.45]">
          Capture os dados obrigatórios e envie para enriquecimento no fluxo n8n.
        </p>
      </div>

      <form
        className="grid gap-3.75"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit((values) => onSubmit(values, reset))();
        }}
        noValidate
      >
        <label className="grid gap-1.75">
          <span className="text-foreground text-[0.9rem] font-[750]">
            Nome{" "}
            <strong className="text-danger" aria-hidden="true">
              *
            </strong>
          </span>
          <input
            className={fieldInputCls}
            autoComplete="name"
            placeholder="Digite o nome completo"
            aria-invalid={Boolean(errors.nome)}
            {...register("nome")}
          />
          {errors.nome ? (
            <small className="text-danger text-[0.79rem] leading-[1.35]" role="alert">
              {errors.nome.message}
            </small>
          ) : null}
        </label>

        <label className="grid gap-1.75">
          <span className="text-foreground text-[0.9rem] font-[750]">
            Telefone{" "}
            <strong className="text-danger" aria-hidden="true">
              *
            </strong>
          </span>
          <input
            className={fieldInputCls}
            inputMode="tel"
            autoComplete="tel"
            placeholder="(00) 00000-0000"
            aria-invalid={Boolean(errors.telefone)}
            {...register("telefone", {
              onChange: (event) => {
                setValue("telefone", formatPhone(event.target.value), { shouldValidate: true });
              },
            })}
          />
          {errors.telefone ? (
            <small className="text-danger text-[0.79rem] leading-[1.35]" role="alert">
              {errors.telefone.message}
            </small>
          ) : null}
        </label>

        <label className="grid gap-1.75">
          <span className="text-foreground text-[0.9rem] font-[750]">
            Produto{" "}
            <strong className="text-danger" aria-hidden="true">
              *
            </strong>
          </span>
          <div className="relative">
            <select
              className={`${fieldInputCls} appearance-none pr-10`}
              aria-invalid={Boolean(errors.produto)}
              {...register("produto")}
            >
              <option value="">Selecione o produto</option>
              {PRODUCT_OPTIONS.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted"
              aria-hidden="true"
            />
          </div>
          {errors.produto ? (
            <small className="text-danger text-[0.79rem] leading-[1.35]" role="alert">
              {errors.produto.message}
            </small>
          ) : null}
        </label>

        <div className="grid gap-1.75">
          <label htmlFor="cep" className="text-foreground text-[0.9rem] font-[750]">
            CEP{" "}
            <strong className="text-danger" aria-hidden="true">
              *
            </strong>
          </label>
          <input
            id="cep"
            className={fieldInputCls}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            aria-invalid={Boolean(errors.cep)}
            {...register("cep", {
              onChange: (event) => {
                setValue("cep", formatCep(event.target.value), { shouldValidate: true });
              },
            })}
          />
          {errors.cep ? (
            <small className="text-danger text-[0.79rem] leading-[1.35]" role="alert">
              {errors.cep.message}
            </small>
          ) : null}
        </div>

        <div className="grid gap-1.75">
          <span className="text-foreground text-[0.9rem] font-[750]">
            Imagem do pedido{" "}
            <strong className="text-danger" aria-hidden="true">
              *
            </strong>
          </span>
          <label className="relative grid min-h-30 place-items-center gap-1.5 border border-dashed border-brand rounded-lg bg-bg-soft text-brand text-center p-4.5 transition-[border-color,background] duration-160 ease-linear hover:bg-surface-raised focus-within:border-brand focus-within:shadow-(--focus) cursor-pointer">
            <input
              type="file"
              aria-label="Imagem do pedido"
              accept="image/png,image/jpeg,image/webp"
              aria-invalid={Boolean(errors.imagem)}
              className="absolute w-px h-px opacity-0 pointer-events-none"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file && file.size > MAX_IMAGE_SIZE_BYTES) {
                  toast.error("A imagem deve ter no máximo 10MB.");
                  event.target.value = "";
                  return;
                }
                setValue("imagem", file as OrderFormValues["imagem"], {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
            />
            <ImageUp size={30} aria-hidden="true" />
            <span className="text-foreground font-[760]">
              Clique para selecionar ou arraste a imagem
            </span>
            <small className="text-muted">PNG, JPG, WEBP até 10MB</small>
          </label>
          {errors.imagem ? (
            <small className="text-danger text-[0.79rem] leading-[1.35]" role="alert">
              {errors.imagem.message}
            </small>
          ) : null}
        </div>

        {selectedImage ? (
          <div className="grid grid-cols-[54px_minmax(0,1fr)_36px] items-center gap-3 min-h-17.5 p-2 border border-border rounded-lg bg-panel-solid">
            <div
              className="relative grid w-13.5 h-13.5 place-items-center overflow-hidden rounded-md bg-surface-raised text-brand"
              aria-hidden="true"
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt=""
                  fill
                  sizes="54px"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <ImageUp size={24} />
              )}
            </div>
            <span className="min-w-0 overflow-hidden text-muted text-[0.88rem] text-ellipsis whitespace-nowrap">
              {imageSummary}
            </span>
            <button
              type="button"
              aria-label="Remover imagem"
              className="grid w-8.5 h-8.5 place-items-center border border-transparent rounded-md bg-transparent text-muted focus-visible:border-brand focus-visible:shadow-(--focus)"
              onClick={() => {
                setValue("imagem", undefined as unknown as OrderFormValues["imagem"], {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        ) : null}

        <button
          className="inline-flex items-center justify-center gap-2.25 min-h-13 border border-brand rounded-md bg-linear-to-b from-brand to-brand-strong text-white text-[0.98rem] font-black outline-none enabled:hover:brightness-105 disabled:border-border disabled:bg-none disabled:bg-disabled-bg disabled:text-disabled-text"
          type="button"
          disabled={disabled}
          aria-busy={isSubmitting}
          style={{ touchAction: "manipulation" }}
          onClick={() => void handleSubmit((values) => onSubmit(values, reset))()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="spin" size={19} aria-hidden="true" />
              Enviando...
            </>
          ) : (
            <>
              <Send size={19} aria-hidden="true" />
              Enviar pedido
            </>
          )}
        </button>
      </form>
    </section>
  );
}

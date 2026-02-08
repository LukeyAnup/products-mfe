import { useTranslation } from "react-i18next";
import ButtonComponent from "./reusable/button";

interface IPaginationProps {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function Pagination({
  page,
  totalPages,
  onPrevious,
  onNext,
}: IPaginationProps) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center items-center gap-3 my-6">
      <ButtonComponent
        disabled={page === 1}
        onClick={onPrevious}
        text={t("pagination.prev")}
      />
      <span>
        {t("pagination.page")} {page} {t("pagination.of")} {totalPages}
      </span>
      <ButtonComponent
        disabled={page === totalPages}
        onClick={onNext}
        text={t("pagination.next")}
      />
    </div>
  );
}

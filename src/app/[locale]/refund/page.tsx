import { LegalLayout } from "@/components/LegalLayout";

type PageProps = { params: Promise<{ locale: string }> };

export const metadata = {
  title: "Refund Policy — Portfolio Pro",
  description: "When and how Portfolio Pro issues refunds.",
};

const UPDATED = "April 19, 2026";

export default async function RefundPage({ params }: PageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";

  if (isAr) {
    return (
      <LegalLayout title="سياسة الاسترداد" updated="١٩ أبريل ٢٠٢٦" isAr>
        <p>
          نريد أن تكون سعيدًا بمنتجك. توضح هذه السياسة متى يحق لك استرداد
          أموالك.
        </p>

        <h2>الاسترداد المضمون خلال ٧ أيام</h2>
        <p>
          إذا لم تكن راضيًا عن البورتفوليو لأي سبب خلال ٧ أيام من الدفع،
          راسلنا واسترد المبلغ بالكامل بدون أسئلة.
        </p>

        <h2>متى لا نستطيع رد المبلغ</h2>
        <ul>
          <li>بعد مرور ٧ أيام من الدفع.</li>
          <li>إذا تم تنزيل ملف PDF أو مشاركة الرابط على نطاق واسع.</li>
          <li>إذا كان طلب الاسترداد بسبب تغيير في رأيك بشأن المهنة أو
            المحتوى الذي أدخلته (يمكنك تعديل المحتوى مجانًا في أي وقت).</li>
        </ul>

        <h2>كيفية طلب الاسترداد</h2>
        <p>
          أرسل بريدًا إلى{" "}
          <a href="mailto:support@portfolio-trimind.com">
            support@portfolio-trimind.com
          </a>{" "}
          مع رقم الفاتورة. نرد خلال ٤٨ ساعة عمل، وتظهر الأموال في حسابك خلال
          ٥–١٠ أيام عمل (حسب البنك).
        </p>

        <h2>المدفوعات الفاشلة أو المكررة</h2>
        <p>
          إذا تم خصم المبلغ مرتين أو لم يتم تفعيل البورتفوليو رغم الدفع، نرد
          الفرق تلقائيًا أو نفعل البورتفوليو فورًا — راسلنا.
        </p>
      </LegalLayout>
    );
  }

  return (
    <LegalLayout title="Refund Policy" updated={UPDATED}>
      <p>
        We want you to be happy with your portfolio. This policy explains when
        you can get your money back.
      </p>

      <h2>7-day satisfaction guarantee</h2>
      <p>
        If you are not satisfied with your portfolio for any reason within 7
        days of payment, email us and we will issue a full refund — no
        questions asked.
      </p>

      <h2>When we cannot refund</h2>
      <ul>
        <li>After 7 days have passed since payment.</li>
        <li>If the PDF has been downloaded or the URL has been widely
          shared.</li>
        <li>
          If the refund request is because you changed your mind about the
          profession or content you entered (you can edit content for free at
          any time).
        </li>
      </ul>

      <h2>How to request a refund</h2>
      <p>
        Email{" "}
        <a href="mailto:support@portfolio-trimind.com">
          support@portfolio-trimind.com
        </a>{" "}
        with your invoice number. We respond within 48 business hours; funds
        appear in your account within 5–10 business days (depending on your
        bank).
      </p>

      <h2>Failed or duplicate payments</h2>
      <p>
        If you were charged twice or your portfolio was not activated after
        payment, we will refund the difference automatically or activate the
        portfolio immediately — just email us.
      </p>
    </LegalLayout>
  );
}

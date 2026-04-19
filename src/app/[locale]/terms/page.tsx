import { LegalLayout } from "@/components/LegalLayout";

type PageProps = { params: Promise<{ locale: string }> };

export const metadata = {
  title: "Terms of Service — Portfolio Pro",
  description: "Terms governing the use of Portfolio Pro.",
};

const UPDATED = "April 19, 2026";

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";

  if (isAr) {
    return (
      <LegalLayout title="شروط الخدمة" updated="١٩ أبريل ٢٠٢٦" isAr>
        <p>
          باستخدامك لـ Portfolio Pro، فإنك توافق على الشروط التالية. اقرأها
          بعناية.
        </p>

        <h2>الخدمة</h2>
        <p>
          تتيح لك Portfolio Pro إنشاء ونشر بورتفوليو احترافي مقابل رسم لمرة
          واحدة قدره ١٫٥ دينار كويتي لكل بورتفوليو.
        </p>

        <h2>الحساب</h2>
        <ul>
          <li>أنت مسؤول عن سرية بيانات الدخول الخاصة بك.</li>
          <li>الحساب الواحد لشخص واحد فقط — لا تشارك حسابك.</li>
          <li>يجب أن تكون المعلومات التي تقدمها صحيحة ومحدّثة.</li>
        </ul>

        <h2>المحتوى</h2>
        <ul>
          <li>أنت تحتفظ بكامل حقوق الملكية على المحتوى الذي تنشره.</li>
          <li>
            تمنحنا ترخيصًا غير حصري لاستضافة وعرض بورتفوليوك أثناء سريان
            الخدمة.
          </li>
          <li>
            يُحظر نشر محتوى غير قانوني، مسيء، مضلل، أو ينتهك حقوق الآخرين.
          </li>
          <li>نحتفظ بحق إزالة أي محتوى ينتهك هذه الشروط دون إشعار مسبق.</li>
        </ul>

        <h2>الدفع</h2>
        <ul>
          <li>الرسم: ١٫٥ دينار كويتي لكل بورتفوليو، مرة واحدة عند النشر.</li>
          <li>تتم المعالجة عبر MyFatoorah — تطبق شروطهم على المعاملة.</li>
          <li>
            بمجرد إتمام الدفع، تخضع طلبات الاسترداد لسياسة الاسترداد
            المنفصلة.
          </li>
        </ul>

        <h2>التوفر</h2>
        <p>
          نسعى لتوفير الخدمة على مدار الساعة دون انقطاع، لكن لا نضمن ذلك. قد
          نجري صيانة دورية أو نواجه أعطالًا طارئة.
        </p>

        <h2>إنهاء الحساب</h2>
        <p>
          يحق لنا تعليق أو إنهاء أي حساب ينتهك هذه الشروط. يحق لك حذف حسابك
          في أي وقت.
        </p>

        <h2>إخلاء المسؤولية</h2>
        <p>
          تُقدَّم الخدمة &quot;كما هي&quot; دون أي ضمانات صريحة أو ضمنية. لا
          نتحمل مسؤولية الأضرار غير المباشرة الناتجة عن استخدامك للخدمة.
        </p>

        <h2>القانون الحاكم</h2>
        <p>تخضع هذه الشروط لقوانين دولة الكويت.</p>

        <h2>التواصل</h2>
        <p>
          <a href="mailto:support@portfolio-trimind.com">
            support@portfolio-trimind.com
          </a>
        </p>
      </LegalLayout>
    );
  }

  return (
    <LegalLayout title="Terms of Service" updated={UPDATED}>
      <p>
        By using Portfolio Pro you agree to these terms. Please read them
        carefully.
      </p>

      <h2>The service</h2>
      <p>
        Portfolio Pro lets you create and publish a professional portfolio for
        a one-time fee of 1.500 KWD per portfolio.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>You are responsible for keeping your credentials secret.</li>
        <li>One account per person. Do not share your account.</li>
        <li>Information you provide must be accurate and current.</li>
      </ul>

      <h2>Your content</h2>
      <ul>
        <li>You retain full ownership of content you publish.</li>
        <li>
          You grant us a non-exclusive license to host and display your
          portfolio while the service is active.
        </li>
        <li>
          You may not publish unlawful, offensive, misleading, or
          rights-infringing content.
        </li>
        <li>
          We reserve the right to remove content that violates these terms.
        </li>
      </ul>

      <h2>Payment</h2>
      <ul>
        <li>
          Fee: 1.500 KWD per portfolio, charged once at the time of publish.
        </li>
        <li>
          Payments are processed by MyFatoorah; their terms apply to the
          transaction.
        </li>
        <li>
          Refunds are governed by our separate{" "}
          <a href="/refund">Refund Policy</a>.
        </li>
      </ul>

      <h2>Availability</h2>
      <p>
        We aim for high availability but do not guarantee uninterrupted
        service. Planned maintenance and unforeseen outages may occur.
      </p>

      <h2>Termination</h2>
      <p>
        We may suspend or terminate accounts that violate these terms. You may
        delete your account at any time.
      </p>

      <h2>Disclaimer</h2>
      <p>
        The service is provided &quot;as is&quot; without express or implied
        warranties. We are not liable for indirect damages arising from your
        use of the service.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of Kuwait.</p>

      <h2>Contact</h2>
      <p>
        <a href="mailto:support@portfolio-trimind.com">
          support@portfolio-trimind.com
        </a>
      </p>
    </LegalLayout>
  );
}

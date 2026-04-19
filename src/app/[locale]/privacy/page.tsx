import { LegalLayout } from "@/components/LegalLayout";

type PageProps = { params: Promise<{ locale: string }> };

export const metadata = {
  title: "Privacy Policy — Portfolio Pro",
  description: "How Portfolio Pro collects, uses, and protects your data.",
};

const UPDATED = "April 19, 2026";

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";

  if (isAr) {
    return (
      <LegalLayout title="سياسة الخصوصية" updated="١٩ أبريل ٢٠٢٦" isAr>
        <p>
          نحترم خصوصيتك. توضح هذه السياسة المعلومات التي نجمعها عند استخدامك
          لـ Portfolio Pro وكيفية استخدامها وحمايتها.
        </p>

        <h2>المعلومات التي نجمعها</h2>
        <ul>
          <li>
            <strong>معلومات الحساب:</strong> الاسم، البريد الإلكتروني (عبر
            Clerk).
          </li>
          <li>
            <strong>محتوى البورتفوليو:</strong> السيرة الذاتية، الخبرات،
            الصور، وأي بيانات تدخلها أنت.
          </li>
          <li>
            <strong>معلومات الدفع:</strong> تتم معالجتها بالكامل عبر
            MyFatoorah؛ لا نخزن بيانات بطاقتك.
          </li>
          <li>
            <strong>بيانات الاستخدام:</strong> سجلات الخادم القياسية (IP،
            المتصفح، الصفحات المُزارة) لأغراض الأمان والتشخيص.
          </li>
        </ul>

        <h2>كيف نستخدم بياناتك</h2>
        <ul>
          <li>تشغيل وعرض البورتفوليو الخاص بك.</li>
          <li>معالجة المدفوعات والاحتفاظ بسجلات المعاملات.</li>
          <li>إرسال إشعارات الخدمة (تأكيدات الدفع، النشر).</li>
          <li>منع الاحتيال وإساءة الاستخدام.</li>
        </ul>

        <h2>المشاركة مع أطراف ثالثة</h2>
        <p>
          نشارك الحد الأدنى من البيانات مع مزودي الخدمة التاليين فقط:{" "}
          <strong>Clerk</strong> (المصادقة)، <strong>Convex</strong> (قاعدة
          البيانات)، <strong>Vercel</strong> (الاستضافة)،{" "}
          <strong>MyFatoorah</strong> (المدفوعات). لا نبيع بياناتك لأي طرف
          ثالث.
        </p>

        <h2>المحتوى المنشور</h2>
        <p>
          عند نشر بورتفوليو، يصبح محتواه متاحًا للعامة على الرابط الذي
          اخترته. لا تنشر أي معلومات حساسة لا ترغب في ظهورها علنًا.
        </p>

        <h2>حقوقك</h2>
        <p>
          يمكنك في أي وقت: تعديل بياناتك، حذف بورتفوليو، أو حذف حسابك بالكامل.
          للطلب، راسلنا على{" "}
          <a href="mailto:support@portfolio-trimind.com">
            support@portfolio-trimind.com
          </a>
          .
        </p>

        <h2>أمان البيانات</h2>
        <p>
          نستخدم HTTPS لجميع الاتصالات، وتشفير قواعد البيانات أثناء التخزين،
          والتحقق من الجلسات بمعايير صناعية (JWT). الوصول إلى بيانات المستخدم
          محصور بمالك الحساب.
        </p>

        <h2>التواصل</h2>
        <p>
          لأي استفسار:{" "}
          <a href="mailto:support@portfolio-trimind.com">
            support@portfolio-trimind.com
          </a>
        </p>
      </LegalLayout>
    );
  }

  return (
    <LegalLayout title="Privacy Policy" updated={UPDATED}>
      <p>
        We respect your privacy. This policy explains what we collect when you
        use Portfolio Pro, how we use it, and how we protect it.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account information:</strong> name and email address (via
          Clerk).
        </li>
        <li>
          <strong>Portfolio content:</strong> bio, work history, photos, and
          any other information you choose to enter.
        </li>
        <li>
          <strong>Payment information:</strong> handled entirely by MyFatoorah.
          We do not store your card details.
        </li>
        <li>
          <strong>Usage data:</strong> standard server logs (IP, browser,
          pages visited) used for security and diagnostics.
        </li>
      </ul>

      <h2>How we use your data</h2>
      <ul>
        <li>To operate and display your portfolio.</li>
        <li>To process payments and keep transaction records.</li>
        <li>
          To send service notifications (payment confirmations, publish
          status).
        </li>
        <li>To prevent fraud and abuse.</li>
      </ul>

      <h2>Sharing with third parties</h2>
      <p>
        We share the minimum necessary data with these processors only:{" "}
        <strong>Clerk</strong> (authentication), <strong>Convex</strong>{" "}
        (database), <strong>Vercel</strong> (hosting), and{" "}
        <strong>MyFatoorah</strong> (payments). We do not sell your data.
      </p>

      <h2>Published content</h2>
      <p>
        When you publish a portfolio, its content becomes publicly available
        at the URL you choose. Do not publish information you wouldn&apos;t
        want public.
      </p>

      <h2>Your rights</h2>
      <p>
        You can edit your data, delete a portfolio, or delete your entire
        account at any time. For requests, email us at{" "}
        <a href="mailto:support@portfolio-trimind.com">
          support@portfolio-trimind.com
        </a>
        .
      </p>

      <h2>Data security</h2>
      <p>
        We use HTTPS for all traffic, database encryption at rest, and
        industry-standard session verification (JWT). Access to user data is
        scoped to the account owner.
      </p>

      <h2>Contact</h2>
      <p>
        Questions:{" "}
        <a href="mailto:support@portfolio-trimind.com">
          support@portfolio-trimind.com
        </a>
      </p>
    </LegalLayout>
  );
}

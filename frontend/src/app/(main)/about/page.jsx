"use client";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ExternalLink, Mail } from "lucide-react";

const team = [
  {
    name: "Chewi Clinton Shu",
    role: "Product Owner",
    image: "/clinton.jpeg",
    bio: "Leads the product vision for LexCam, translating complex legal access challenges in Cameroon into actionable features. Responsible for the product roadmap, stakeholder alignment, and ensuring every sprint delivers real value to citizens.",
    github: "chewi-clinton",
    email: "suhchenwi48@gmail.com",
  },
  {
    name: "Ngindem Phinees",
    role: "Scrum Master",
    image: "/phineas.jpeg",
    bio: "Facilitates agile ceremonies and shields the team from blockers. Ensures the team adheres to Scrum values, tracks sprint velocity, and drives continuous improvement across LexCam's 11-service microservices architecture.",
    github: null,
    email: null,
  },
];

const techStack = [
  {
    category: "Frontend",
    items: ["Next.js 14", "Tailwind CSS", "React", "Playwright"],
  },
  {
    category: "Backend",
    items: ["Django REST", "FastAPI", "Celery", "Gunicorn"],
  },
  {
    category: "AI & ML",
    items: ["Groq LLaMA 3.3", "Qdrant", "HuggingFace", "Ollama/Qwen"],
  },
  {
    category: "Infrastructure",
    items: ["K3s", "Helm", "Jenkins CI/CD", "Prometheus + Grafana"],
  },
  {
    category: "Messaging",
    items: ["RabbitMQ", "Dead Letter Exchange", "Event-Driven Workers"],
  },
  { category: "Databases", items: ["PostgreSQL", "Redis", "MinIO"] },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header activePage="about" />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary text-white py-20 px-6 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            About LexCam
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            An AI-powered legal aid platform making Cameroonian law accessible
            to every citizen — in French and English.
          </p>
        </section>

        {/* Mission */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="font-serif text-3xl font-bold text-primary mb-6 text-center">
            Our Mission
          </h2>
          <p className="text-muted text-lg leading-relaxed text-center max-w-3xl mx-auto">
            LexCam bridges the gap between citizens and the law in Cameroon. By
            combining a bilingual AI assistant grounded in actual Cameroonian
            legislation, a verified lawyer directory, and a document generator,
            we give every person — regardless of income or location — the tools
            to understand and assert their legal rights.
          </p>
        </section>

        {/* Team */}
        <section className="bg-gray-50 py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl font-bold text-primary mb-12 text-center">
              Meet the Team
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden"
                >
                  <div className="bg-primary/5 px-8 pt-8 pb-4 flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md mb-4">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-primary">
                      {member.name}
                    </h3>
                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-accent/10 text-accent text-sm font-medium">
                      {member.role}
                    </span>
                  </div>
                  <div className="px-8 py-6">
                    <p className="text-muted text-sm leading-relaxed">
                      {member.bio}
                    </p>
                    <div className="flex items-center gap-4 mt-5">
                      {member.github && (
                        <a
                          href={`https://github.com/${member.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors"
                        >
                          <ExternalLink size={16} />
                          <span>GitHub</span>
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors"
                        >
                          <Mail size={16} />
                          <span>Email</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="font-serif text-3xl font-bold text-primary mb-10 text-center">
            Technology Stack
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {techStack.map(({ category, items }) => (
              <div
                key={category}
                className="border border-gray-200/60 rounded-xl p-5 bg-white shadow-sm"
              >
                <h3 className="font-semibold text-primary mb-3 text-sm uppercase tracking-wide">
                  {category}
                </h3>
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-muted flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture note */}
        <section className="bg-primary/5 py-14 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">
              Architecture
            </h2>
            <p className="text-muted leading-relaxed">
              LexCam runs on a hybrid microservices + event-driven architecture
              deployed on K3s on a single Contabo VPS. 11 core services
              communicate through Kong API Gateway and a RabbitMQ topic exchange
              with Dead Letter Exchange for resilience. All services are
              containerized, Helm-deployed, and continuously delivered via a
              9-stage Jenkins pipeline with SonarCloud quality gates and Trivy
              security scanning.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

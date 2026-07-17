import React, { useState } from "react";
import { CustomizeLayout, NavSection } from "../components/CustomizeLayout";
import { MyTemplatesView } from "../components/MyTemplatesView";
import { SharedTemplatesView } from "../components/SharedTemplatesView";

export default function R1Baseline() {
  const [activeSection, setActiveSection] = useState<NavSection>("my-templates");
  const [selectedTemplate, setSelectedTemplate] = useState("soap-note");

  return (
    <CustomizeLayout
      activeSection={activeSection}
      selectedTemplate={selectedTemplate}
      onSectionChange={setActiveSection}
      onTemplateChange={setSelectedTemplate}
    >
      {activeSection === "my-templates" ? (
        <MyTemplatesView key={`my-${selectedTemplate}`} />
      ) : (
        <SharedTemplatesView key={`shared-${selectedTemplate}`} />
      )}
    </CustomizeLayout>
  );
}

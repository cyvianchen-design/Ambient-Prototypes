import React, { useState } from "react";
import { CustomizeLayout, NavSection } from "../components/CustomizeLayout";
import { ThreePanelView } from "../components/ThreePanelView";

export default function R1ThreePanel() {
  const [activeSection, setActiveSection] = useState<NavSection>("my-templates");
  const [selectedTemplate, setSelectedTemplate] = useState("soap-note");

  return (
    <CustomizeLayout
      activeSection={activeSection}
      selectedTemplate={selectedTemplate}
      onSectionChange={setActiveSection}
      onTemplateChange={setSelectedTemplate}
    >
      <ThreePanelView
        key={`${activeSection}-${selectedTemplate}`}
        mode={activeSection === "my-templates" ? "my" : "shared"}
      />
    </CustomizeLayout>
  );
}

import React, { useState } from "react";
import { CustomizeLayout, NavSection } from "../components/CustomizeLayout";
import { OutlinedView } from "../components/OutlinedView";

export default function R2Outlined() {
  const [activeSection, setActiveSection] = useState<NavSection>("my-templates");
  const [selectedTemplate, setSelectedTemplate] = useState("soap-note");

  return (
    <CustomizeLayout
      activeSection={activeSection}
      selectedTemplate={selectedTemplate}
      onSectionChange={setActiveSection}
      onTemplateChange={setSelectedTemplate}
    >
      <OutlinedView
        key={`${activeSection}-${selectedTemplate}`}
        mode={activeSection === "my-templates" ? "my" : "shared"}
      />
    </CustomizeLayout>
  );
}

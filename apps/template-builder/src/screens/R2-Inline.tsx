import React, { useState } from "react";
import { CustomizeLayout, NavSection } from "../components/CustomizeLayout";
import { InlineExpandView } from "../components/InlineExpandView";

export default function R2Inline() {
  const [activeSection, setActiveSection] = useState<NavSection>("my-templates");
  const [selectedTemplate, setSelectedTemplate] = useState("soap-note");

  return (
    <CustomizeLayout
      activeSection={activeSection}
      selectedTemplate={selectedTemplate}
      onSectionChange={setActiveSection}
      onTemplateChange={setSelectedTemplate}
    >
      <InlineExpandView
        key={`${activeSection}-${selectedTemplate}`}
        mode={activeSection === "my-templates" ? "my" : "shared"}
      />
    </CustomizeLayout>
  );
}

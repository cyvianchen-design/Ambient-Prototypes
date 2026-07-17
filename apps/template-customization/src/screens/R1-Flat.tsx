import React, { useState } from "react";
import { CustomizeLayout, NavSection } from "../components/CustomizeLayout";
import { FlatView } from "../components/FlatView";

export default function R1Flat() {
  const [activeSection, setActiveSection] = useState<NavSection>("my-templates");
  const [selectedTemplate, setSelectedTemplate] = useState("soap-note");

  return (
    <CustomizeLayout
      activeSection={activeSection}
      selectedTemplate={selectedTemplate}
      onSectionChange={setActiveSection}
      onTemplateChange={setSelectedTemplate}
    >
      <FlatView
        key={`${activeSection}-${selectedTemplate}`}
        mode={activeSection === "my-templates" ? "my" : "shared"}
      />
    </CustomizeLayout>
  );
}

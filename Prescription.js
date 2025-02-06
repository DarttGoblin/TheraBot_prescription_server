const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const pl = require('tau-prolog');

const app = express();
const port = 3003;

app.use(express.json());
app.use(cors());

const prologProgram = `
    recommendation(spontaneous_rupture_of_oesophagus, "Seek emergency medical attention immediately. Do not eat or drink anything, as this can worsen the condition. Remain in an upright position to reduce discomfort. Emergency surgical intervention is often required, so immediate hospitalization is critical.").  
    treatment(spontaneous_rupture_of_oesophagus, "Surgical repair of the esophageal rupture is the primary treatment. Patients require IV fluids, broad-spectrum antibiotics to prevent infections, and pain management. In severe cases, a feeding tube or total parenteral nutrition may be necessary until the esophagus heals.").  
    recommendation(oesophagitis, "Avoid foods and beverages that can trigger or worsen symptoms, such as acidic, spicy, or very hot foods. Elevate the head while sleeping to prevent acid reflux. Quit smoking and alcohol consumption, as they can irritate the esophagus. Manage stress, as it can contribute to symptoms.").  
    treatment(oesophagitis, "Proton pump inhibitors (PPIs) such as omeprazole or lansoprazole are commonly prescribed to reduce acid production. Antacids can provide temporary relief, while H2 receptor blockers like ranitidine may also help. If caused by an infection, antifungal or antiviral medications may be needed.").  
    recommendation(gastric_outlet_obstruction, "Stay hydrated and avoid consuming solid foods until symptoms improve. If vomiting occurs frequently, electrolyte replacement may be necessary. Seek medical evaluation to determine the underlying cause, which could include peptic ulcers, tumors, or scarring from chronic inflammation.").  
    treatment(gastric_outlet_obstruction, "Treatment depends on the cause. If due to peptic ulcer disease, PPIs and H. pylori eradication therapy may be needed. Endoscopic dilation or stent placement can help open the obstruction. In severe cases, surgical intervention such as gastrojejunostomy may be required.").  
    recommendation(gastritis, "Avoid the use of NSAIDs like ibuprofen and aspirin, as they can irritate the stomach lining. Limit alcohol consumption and avoid spicy or highly acidic foods. Eat smaller, more frequent meals rather than large meals to reduce stomach irritation. Manage stress through relaxation techniques like meditation or yoga.").  
    treatment(gastritis, "Treatment depends on the cause. If due to H. pylori infection, antibiotics such as amoxicillin and clarithromycin are used along with PPIs. Antacids and H2 blockers can help reduce acid production. In cases of autoimmune gastritis, vitamin B12 supplementation may be required.").  
    recommendation(gastric_ulcer, "Avoid known irritants such as caffeine, alcohol, and smoking. Eat bland, easily digestible foods to minimize stomach irritation. Manage stress effectively, as it can contribute to ulcer formation. Maintain a regular eating schedule and avoid long gaps between meals.").  
    treatment(gastric_ulcer, "Proton pump inhibitors (PPIs) and H2 receptor blockers are commonly used to reduce acid production and promote healing. If caused by H. pylori infection, a combination of antibiotics and acid suppressors is prescribed. In severe cases, endoscopic therapy or surgery may be required to stop bleeding or repair the ulcer.").  
    recommendation(intussusception_of_small_intestine, "Seek emergency medical care immediately, as this condition can lead to bowel obstruction and severe complications. Avoid eating or drinking until medical evaluation is done. Symptoms such as severe abdominal pain, vomiting, and bloody stools require urgent attention.").  
    treatment(intussusception_of_small_intestine, "Non-surgical reduction using an air or barium enema is the first-line treatment in children. If unsuccessful or if there are signs of bowel perforation, surgery is required to manually reduce the intussusception or remove the affected portion of the intestine.").  
    recommendation(intussusception_of_large_intestine, "Seek immediate medical evaluation if experiencing severe abdominal pain, vomiting, or bloody stools. Avoid consuming food or liquids until a doctor assesses the condition. Delay in treatment can lead to serious complications, including bowel perforation.").  
    treatment(intussusception_of_large_intestine, "Surgical intervention is often required to correct the intussusception. In some cases, an air enema may be attempted, but surgery is more commonly needed for adults. Supportive care includes IV fluids, pain management, and close monitoring for complications.").  
    recommendation(appendicitis, "If experiencing symptoms like sharp lower-right abdominal pain, nausea, or fever, seek immediate medical attention. Avoid eating or drinking, as surgery may be needed. Applying heat to the abdomen or taking painkillers is not recommended before diagnosis.").  
    treatment(appendicitis, "Surgical removal of the appendix (appendectomy) is the standard treatment. In some cases, antibiotics alone may be attempted if surgery is not immediately available. Post-surgery, patients should follow a light diet and avoid heavy physical activity until fully healed.").  
    recommendation(cholelithiasis, "Adopt a low-fat diet to reduce gallbladder stress. Maintain a healthy weight, as obesity increases the risk of gallstones. Avoid rapid weight loss, as it can contribute to gallstone formation. Stay hydrated and engage in regular physical activity.").  
    treatment(cholelithiasis, "Surgical removal of the gallbladder (cholecystectomy) is the definitive treatment for symptomatic gallstones. If surgery is not an option, bile acid medications such as ursodeoxycholic acid may be used to dissolve stones. Pain management with NSAIDs or opioids may be needed temporarily.").  
    recommendation(acute_pancreatitis, "Refrain from eating or drinking to allow the pancreas to rest. Seek urgent medical care, as pancreatitis can cause serious complications. Avoid alcohol consumption and smoking. Stay hydrated with IV fluids under medical supervision.").  
    treatment(acute_pancreatitis, "Initial treatment includes IV fluids, pain management, and bowel rest (fasting). In cases caused by gallstones, endoscopic removal may be necessary. If infection develops, antibiotics are prescribed. Severe cases may require hospitalization in the ICU with advanced supportive care.").  
    recommendation(hepatitis, "Avoid alcohol and drugs that can harm the liver. Get plenty of rest, stay hydrated, and eat a balanced diet. Seek medical evaluation for antiviral treatment if applicable.").  
    treatment(hepatitis, "Treatment depends on the type of hepatitis. Acute cases may require supportive care, while chronic hepatitis B and C may require antiviral medications. Liver transplantation may be necessary in severe cases.").  
    recommendation(crohn_disease, "Maintain a low-fiber diet during flare-ups. Avoid trigger foods like dairy, spicy foods, and alcohol. Manage stress and follow prescribed medications.").  
    treatment(crohn_disease, "Treatment includes corticosteroids, immunosuppressants, and biologics. In severe cases, surgery may be required to remove damaged portions of the intestine.").  
    recommendation(ulcerative_colitis, "Follow a low-fiber diet during flare-ups. Stay hydrated, manage stress, and avoid dairy and high-fat foods. Regular follow-ups are essential.").  
    treatment(ulcerative_colitis, "Aminosalicylates, corticosteroids, and immunosuppressants are common treatments. In severe cases, colectomy may be necessary.").  
    recommendation(irritable_bowel_syndrome, "Eat small, frequent meals and avoid trigger foods like caffeine and artificial sweeteners. Manage stress and get regular exercise.").  
    treatment(irritable_bowel_syndrome, "Treatment includes dietary changes, probiotics, fiber supplements, and medications like antispasmodics or laxatives based on symptoms.").  
    recommendation(diverticulitis, "Avoid seeds, nuts, and high-fiber foods during flare-ups. Stay hydrated and follow a liquid diet until symptoms improve.").  
    treatment(diverticulitis, "Mild cases are treated with antibiotics and a liquid diet. Severe cases may require hospitalization, IV antibiotics, or surgery in cases of complications.").  
    recommendation(gastroenteritis, "Rest and stay hydrated with electrolyte solutions. Avoid solid foods until vomiting subsides. Wash hands frequently to prevent spread.").  
    treatment(gastroenteritis, "Treatment is primarily supportive, including hydration therapy. In bacterial cases, antibiotics may be necessary.").  
    recommendation(peptic_ulcer, "Avoid NSAIDs, alcohol, and caffeine. Eat smaller meals and avoid acidic or spicy foods. Manage stress effectively.").  
    treatment(peptic_ulcer, "Proton pump inhibitors and antibiotics for H. pylori infections are common treatments. Severe cases may require surgery.").  
    recommendation(celiac_disease, "Follow a strict gluten-free diet. Avoid wheat, barley, and rye-containing products. Monitor nutrient levels regularly.").  
    treatment(celiac_disease, "The only treatment is lifelong adherence to a gluten-free diet. Nutritional supplements may be necessary for deficiencies.").  
    recommendation(gallbladder_inflammation, "Avoid fatty meals and large portions. Seek medical attention if symptoms worsen. Surgery may be required.").  
    treatment(gallbladder_inflammation, "Treatment includes pain management, antibiotics, and cholecystectomy (gallbladder removal) for recurrent cases.").  
    recommendation(peritonitis, "Seek emergency medical care immediately. Avoid eating or drinking anything until evaluated by a doctor.").  
    treatment(peritonitis, "Immediate hospitalization, IV antibiotics, and possible surgical intervention to remove infected tissue or treat the underlying cause.").  
    recommendation(hernia, "Avoid heavy lifting and strenuous activities. Use supportive garments if recommended. Seek medical advice if the hernia enlarges or becomes painful.").  
    treatment(hernia, "Surgical repair is the definitive treatment, either through open surgery or laparoscopic techniques.").  
    recommendation(gastroesophageal_reflux_disease, "Avoid lying down immediately after eating. Reduce acidic, spicy, and fatty foods. Maintain a healthy weight.").  
    treatment(gastroesophageal_reflux_disease, "Treatment includes proton pump inhibitors, H2 blockers, and lifestyle modifications. Severe cases may require surgery.").  
    recommendation(liver_cirrhosis, "Avoid alcohol completely. Follow a low-sodium diet and monitor fluid retention. Seek medical care for worsening symptoms.").  
    treatment(liver_cirrhosis, "Treatment focuses on managing complications with diuretics, beta-blockers, or liver transplantation in end-stage cases.").  
    recommendation(meckel_diverticulum, "Seek medical attention if experiencing pain or bleeding. Avoid self-medicating.").  
    treatment(meckel_diverticulum, "Symptomatic cases require surgical resection of the diverticulum.").  
    recommendation(pyloric_stenosis, "Monitor for dehydration and seek urgent medical care if vomiting persists.").  
    treatment(pyloric_stenosis, "Surgical intervention (pyloromyotomy) is required to relieve the obstruction.").  
    recommendation(splenic_rupture, "Seek emergency medical attention immediately. Avoid any physical activity to prevent further injury.").  
    treatment(splenic_rupture, "Treatment varies from close monitoring in minor cases to splenectomy (surgical removal of the spleen) in severe cases.").  
    recommendation(volvulus, "Seek emergency care immediately if symptoms of bowel obstruction appear. Avoid eating or drinking until evaluated.").  
    treatment(volvulus, "Treatment requires emergency surgery to untwist the bowel. Severe cases may require resection of the affected intestine.").  
    recommendation(malabsorption_syndrome, "Follow a nutrient-rich diet and address underlying conditions. Avoid trigger foods that exacerbate symptoms.").  
    treatment(malabsorption_syndrome, "Treatment depends on the cause and may include enzyme replacement, vitamin supplements, and dietary modifications.").  
    recommendation(ischemic_colitis, "Seek medical attention if experiencing sudden abdominal pain or bloody diarrhea. Avoid NSAIDs and maintain hydration.").  
    treatment(ischemic_colitis, "Treatment includes IV fluids, bowel rest, and in severe cases, surgery to remove necrotic bowel tissue.").  
    recommendation(hirschsprung_disease, "Seek medical care if a newborn fails to pass meconium or has chronic constipation.").  
    treatment(hirschsprung_disease, "Definitive treatment is surgical removal of the affected segment of the colon (pull-through procedure).").  
`;

const session = pl.create();
session.consult(prologProgram, function(success) {
    if (!success) {
        console.error("Failed to load Prolog program");
    }
});

app.post('/', (req, res) => {
    const confirmed_disease = req.body.confirmed_disease.replace(/\s+/g, "_");

    session.query(`recommendation(${confirmed_disease}, Rec).`, function(success) {
        if (!success) {
            return res.status(404).json({ success: false, error: `No recommendation found for ${confirmed_disease}` });
        }

        session.answer(function(answer) {
            if (!answer || !answer.links || !answer.links.Rec) {
                return res.status(404).json({ success: false, error: `No recommendation data available for ${confirmed_disease}` });
            }

            // Convert Prolog term to JavaScript string
            const recommendation = answer.links.Rec.toJavaScript().join('');

            session.query(`treatment(${confirmed_disease}, Treat).`, function(success) {
                if (!success) {
                    return res.status(404).json({ success: false, error: `No treatment found for ${confirmed_disease}` });
                }

                session.answer(function(answer) {
                    if (!answer || !answer.links || !answer.links.Treat) {
                        return res.status(404).json({ success: false, error: `No treatment data available for ${confirmed_disease}` });
                    }

                    // Convert Prolog term to JavaScript string
                    const treatment = answer.links.Treat.toJavaScript().join('');

                    try {
                        const doc = new PDFDocument();
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', 'attachment; filename="Prescription.pdf"');
                        doc.on('error', (err) => {
                            console.error('PDF Error:', err);
                            res.status(500).end();
                        });
                        doc.pipe(res);
                        
                        doc.image(path.join(__dirname, 'logo-no-bg.png'), {
                            fit: [100, 100],
                            x: doc.page.width - 130, 
                            y: 30
                        });
                    
                        doc.fillColor('#6240E8').fontSize(40).text('TheraBot', 30, 50);
                        doc.fillColor('#646464').fontSize(20).text('Diagnosis ChatBot', 30, 90);
                        doc.strokeColor('#6240E8') 
                           .lineWidth(3)
                           .moveTo(20, 160) 
                           .lineTo(doc.page.width - 20, 160) 
                           .stroke();
                        doc.moveDown();
                        
                        doc.fillColor('#000000').fontSize(20).text('Disease:', 30, 200);
                        doc.fillColor('#646464').fontSize(16).text(CapitalizeName(confirmed_disease.replace(/_/g, ' ')), 50, 230);
                        
                        // Handle dynamic treatment block height
                        const treatmentTextHeight = doc.heightOfString(treatment, { width: doc.page.width - 60 });
                        
                        doc.moveDown();
                        doc.fillColor('#000000').fontSize(20).text('Treatment:', 30, 270);
                        doc.fillColor('#646464').fontSize(16).text(treatment, 50, 300, { width: doc.page.width - 60 });
                    
                        // Set y position for "Recommendation" based on the treatment height
                        const recommendationY = 300 + treatmentTextHeight + 20; // Adjust the spacing here if needed
                    
                        doc.moveDown();
                        doc.fillColor('#000000').fontSize(20).text('Recommendation:', 30, recommendationY);
                        doc.fillColor('#646464').fontSize(16).text(recommendation, 50, recommendationY + 30);
                    
                        doc.image(path.join(__dirname, 'signature.png'), {
                            fit: [100, 50],
                            x: doc.page.width - 130, 
                            y: doc.page.height - 80
                        });
                    
                        doc.end();
                    } catch (error) {
                        console.error('Server Error:', error);
                        res.status(500).json({ error: 'Internal server error' });
                    }                    
                });
            });
        });
    });
});

function CapitalizeName(name) {
    return name.split(' ')
               .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
               .join(' ');
}

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
